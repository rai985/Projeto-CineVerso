from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import random
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
CORS(app)

API_KEY = '41b60bb6b2c8e16b78683498a80e20ea'

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

GENRES_DESCRIPTION = {
    "ação": "filmes com lutas, perseguições, aventura intensa",
    "comédia": "filmes divertidos e engraçados para rir",
    "drama": "filmes emocionantes sobre a vida e sentimentos",
    "terror": "filmes assustadores e cheios de suspense",
    "ficção científica": "filmes com tecnologia futurista e espaço",
    "romance": "filmes sobre relacionamentos amorosos e paixão",
    "animação": "filmes animados, geralmente para todas as idades",
}

user_sessions = {}

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user = data.get("user", "default")
    msg = data.get("message", "").strip().lower()

    session = user_sessions.get(user, {"step": "greet"})

    if session["step"] == "greet":
        session["step"] = "ask_genre"
        user_sessions[user] = session
        return jsonify({"reply": "Oi! Qual tipo de filme você está procurando?"})

    elif session["step"] == "ask_genre":
        genre = detectar_genero(msg)
        if not genre:
            return jsonify({"reply": "Hmm... não entendi o gênero. Pode tentar com outras palavras?"})

        session["genre"] = genre
        session["step"] = "recommend"
        user_sessions[user] = session

        genres_map = get_genre_map()
        genre_id = genres_map.get(genre)
        if not genre_id:
            return jsonify({"reply": f"Gênero '{genre}' não encontrado na base de dados."})

        movies = get_movies_by_genre(genre_id)
        session["last_recommendations"] = movies
        user_sessions[user] = session

        texto = format_movies(movies)
        return jsonify({"reply": f"Beleza! Encontrei alguns filmes de *{genre}*:<br><br>{texto}<br><br>Quer mais sugestões? (sim/não)"})

    elif session["step"] == "recommend":
        if "sim" in msg:
            genre = session["genre"]
            genres_map = get_genre_map()
            genre_id = genres_map.get(genre)
            movies = get_movies_by_genre(genre_id)
            session["last_recommendations"] = movies
            user_sessions[user] = session
            texto = format_movies(movies)
            return jsonify({"reply": f"Aqui vão mais filmes de *{genre}*:<br><br>{texto}<br><br>Quer mais sugestões?"})
        else:
            session["step"] = "done"
            user_sessions[user] = session
            return jsonify({"reply": "Ok! Espero que goste dos filmes 😊"})

    elif session["step"] == "done":
        # Reinicia a conversa após o término
        session = {"step": "ask_genre"}
        user_sessions[user] = session
        return jsonify({"reply": "Oi de novo! Qual tipo de filme você quer agora?"})

    return jsonify({"reply": "Desculpe, não entendi. Pode repetir?"})

def detectar_genero(texto):
    entrada = model.encode(texto, convert_to_tensor=True)
    melhor_score = -1
    melhor_genero = None
    for genero, descricao in GENRES_DESCRIPTION.items():
        desc_emb = model.encode(descricao, convert_to_tensor=True)
        score = util.cos_sim(entrada, desc_emb).item()
        if score > melhor_score:
            melhor_score = score
            melhor_genero = genero
    return melhor_genero

def get_genre_map():
    url = f"https://api.themoviedb.org/3/genre/movie/list?api_key={API_KEY}&language=pt-BR"
    response = requests.get(url).json()
    return {g['name'].lower(): g['id'] for g in response['genres']}

def get_movies_by_genre(genre_id):
    url = f"https://api.themoviedb.org/3/discover/movie?api_key={API_KEY}&language=pt-BR&with_genres={genre_id}"
    response = requests.get(url).json()
    movies = response.get("results", [])
    return random.sample(movies, min(3, len(movies)))

def format_movies(movies):
    output = []
    for m in movies:
        titulo = f"🎬 {m['title']}"
        sinopse = m.get('overview', 'Sem descrição.')
        poster_path = m.get('poster_path')
        poster_url = f"https://image.tmdb.org/t/p/w200{poster_path}" if poster_path else None
        watch_url = f"https://www.themoviedb.org/movie/{m['id']}/watch?locale=BR"

        bloco = f"<strong>{titulo}</strong><br>"
        if poster_url:
            bloco += f"<img src='{poster_url}' style='width:100px'><br>"
        bloco += f"{sinopse}<br>"
        bloco += f"🔗 <a href='{watch_url}' target='_blank'>Onde assistir</a><br>"
        output.append(bloco)
    return "<br><br>".join(output)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

