import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

from src.routes.auth import auth_bp
from src.routes.pacientes import pacientes_bp
from src.routes.contratos import contratos_bp
from src.routes.fornecedores import fornecedores_bp
from src.routes.lancamentos import lancamentos_bp
from src.routes.bi import bi_bp
from src.models.contrato import db


app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-for-sistema-financeiro'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 horas

# Configuração CORS

CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        return response, 200

# Configuração JWT
jwt = JWTManager(app)

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"Token inválido recebido: {error}")
    return jsonify({"error": "Token inválido ou mal formatado"}), 422

# Registro de blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(pacientes_bp, url_prefix='/api/pacientes')
app.register_blueprint(contratos_bp, url_prefix='/api/contratos')
app.register_blueprint(fornecedores_bp, url_prefix='/api/fornecedores')
app.register_blueprint(lancamentos_bp, url_prefix='/api/lancamentos')
app.register_blueprint(bi_bp, url_prefix='/api/bi')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://inmecap:1nm3c%40p@localhost:3306/sistema_financeiro"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

migrate = Migrate(app, db)

# Criação das tabelas
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404
        


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
