from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.paciente import Paciente, db
from datetime import datetime

pacientes_bp = Blueprint('pacientes', __name__)

@pacientes_bp.route('/', methods=['GET'])
@jwt_required()
def listar_pacientes():
    """Endpoint para listar todos os pacientes"""
    pacientes = Paciente.query.all()
    
    resultado = []
    for paciente in pacientes:
        resultado.append({
            "id": paciente.id,
            "nome": paciente.nome,
            "cpf": paciente.cpf,
            "data_nascimento": paciente.data_nascimento.isoformat() if paciente.data_nascimento else None,
            "identificador": paciente.identificador,
            "telefone": paciente.telefone,
            "email": paciente.email,
            "endereco": paciente.endereco,
            "data_cadastro": paciente.data_cadastro.isoformat(),
            "nacionalidade": paciente.nacionalidade
        })
    
    return jsonify(resultado), 200

@pacientes_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_paciente(id):
    """Endpoint para obter um paciente específico"""
    paciente = Paciente.query.get(id)
    
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    return jsonify({
        "id": paciente.id,
        "nome": paciente.nome,
        "cpf": paciente.cpf,
        "data_nascimento": paciente.data_nascimento.isoformat() if paciente.data_nascimento else None,
        "identificador": paciente.identificador,
        "telefone": paciente.telefone,
        "email": paciente.email,
        "endereco": paciente.endereco,
        "data_cadastro": paciente.data_cadastro.isoformat(),
        "nacionalidade": paciente.nacionalidade
    }), 200

@pacientes_bp.route('/', methods=['POST'])
@jwt_required()
def criar_paciente():
    """Endpoint para criar um novo paciente"""
    dados = request.get_json()
    print(dados)
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    # Campos obrigatórios
    nome = request.json.get('nome', None)
    cpf = request.json.get('cpf', None)
    data_nascimento = request.json.get('data_nascimento', None)
    
    if not nome or not cpf or not data_nascimento:
        return jsonify({"msg": "Nome, CPF e data de nascimento são obrigatórios"}), 400
    
    # Verifica se CPF já existe
    existing_paciente = Paciente.query.filter_by(cpf=cpf).first()
    if existing_paciente:
        return jsonify({"msg": "CPF já cadastrado"}), 409
    
    try:
        # Converte string para data
        data_nascimento = datetime.fromisoformat(data_nascimento.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    # Campos opcionais
    telefone = request.json.get('telefone')
    email = request.json.get('email')
    endereco = request.json.get('endereco')
    nacionalidade = request.json.get('nacionalidade')
    
    # Gera identificador único
    identificador = Paciente.gerar_identificador()
    
    # Cria novo paciente
    novo_paciente = Paciente(
        nome=nome,
        cpf=cpf,
        data_nascimento=data_nascimento,
        identificador=identificador,
        telefone=telefone,
        email=email,
        endereco=endereco,
        nacionalidade=nacionalidade
    )
    
    db.session.add(novo_paciente)
    db.session.commit()
    
    return jsonify({
        "msg": "Paciente criado com sucesso",
        "paciente": {
            "id": novo_paciente.id,
            "nome": novo_paciente.nome,
            "cpf": novo_paciente.cpf,
            "data_nascimento": novo_paciente.data_nascimento.isoformat(),
            "identificador": novo_paciente.identificador,
            "telefone": novo_paciente.telefone,
            "email": novo_paciente.email,
            "endereco": novo_paciente.endereco,
            "data_cadastro": novo_paciente.data_cadastro.isoformat(),
            "nacionalidade": novo_paciente.nacionalidade
        }
    }), 201

@pacientes_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_paciente(id):
    """Endpoint para atualizar um paciente existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    paciente = Paciente.query.get(id)
    
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    # Atualiza campos
    if 'nome' in request.json:
        paciente.nome = request.json['nome']
    
    if 'cpf' in request.json:
        # Verifica se CPF já existe em outro paciente
        existing_paciente = Paciente.query.filter_by(cpf=request.json['cpf']).first()
        if existing_paciente and existing_paciente.id != id:
            return jsonify({"msg": "CPF já cadastrado para outro paciente"}), 409
        paciente.cpf = request.json['cpf']
    
    if 'data_nascimento' in request.json:
        try:
            paciente.data_nascimento = datetime.fromisoformat(request.json['data_nascimento'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    if 'telefone' in request.json:
        paciente.telefone = request.json['telefone']
    
    if 'email' in request.json:
        paciente.email = request.json['email']
    
    if 'endereco' in request.json:
        paciente.endereco = request.json['endereco']

    if 'nacionalidade' in request.json:
        paciente.nacionalidade = request.json['nacionalidade']
    
    db.session.commit()
    
    return jsonify({
        "msg": "Paciente atualizado com sucesso",
        "paciente": {
            "id": paciente.id,
            "nome": paciente.nome,
            "cpf": paciente.cpf,
            "data_nascimento": paciente.data_nascimento.isoformat(),
            "identificador": paciente.identificador,
            "telefone": paciente.telefone,
            "email": paciente.email,
            "endereco": paciente.endereco,
            "data_cadastro": paciente.data_cadastro.isoformat(),
            "nacionalidade": paciente.nacionalidade
        }
    }), 200

@pacientes_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def excluir_paciente(id):
    """Endpoint para excluir um paciente"""
    paciente = Paciente.query.get(id)
    
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    # Verifica se paciente possui contratos
    if paciente.contratos:
        return jsonify({"msg": "Não é possível excluir paciente com contratos associados"}), 400
    
    db.session.delete(paciente)
    db.session.commit()
    
    return jsonify({"msg": "Paciente excluído com sucesso"}), 200
