from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.fornecedor import Fornecedor, db
from datetime import datetime

fornecedores_bp = Blueprint('fornecedores', __name__)

@fornecedores_bp.route('/', methods=['GET'])
@jwt_required()
def listar_fornecedores():
    """Endpoint para listar todos os fornecedores"""
    fornecedores = Fornecedor.query.all()
    
    resultado = []
    for fornecedor in fornecedores:
        resultado.append({
            "id": fornecedor.id,
            "nome": fornecedor.nome,
            "cpf_cnpj": fornecedor.cpf_cnpj,
            "identificador": fornecedor.identificador,
            "telefone": fornecedor.telefone,
            "email": fornecedor.email,
            "endereco": fornecedor.endereco,
            "data_cadastro": fornecedor.data_cadastro.isoformat()
        })
    
    return jsonify(resultado), 200

@fornecedores_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_fornecedor(id):
    """Endpoint para obter um fornecedor específico"""
    fornecedor = Fornecedor.query.get(id)
    
    if not fornecedor:
        return jsonify({"msg": "Fornecedor não encontrado"}), 404
    
    return jsonify({
        "id": fornecedor.id,
        "nome": fornecedor.nome,
        "cpf_cnpj": fornecedor.cpf_cnpj,
        "identificador": fornecedor.identificador,
        "telefone": fornecedor.telefone,
        "email": fornecedor.email,
        "endereco": fornecedor.endereco,
        "data_cadastro": fornecedor.data_cadastro.isoformat()
    }), 200

@fornecedores_bp.route('/', methods=['POST'])
@jwt_required()
def criar_fornecedor():
    """Endpoint para criar um novo fornecedor"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    # Campos obrigatórios
    nome = request.json.get('nome', None)
    cpf_cnpj = request.json.get('cpf_cnpj', None)
    
    if not nome or not cpf_cnpj:
        return jsonify({"msg": "Nome e CPF/CNPJ são obrigatórios"}), 400
    
    # Verifica se CPF/CNPJ já existe
    existing_fornecedor = Fornecedor.query.filter_by(cpf_cnpj=cpf_cnpj).first()
    if existing_fornecedor:
        return jsonify({"msg": "CPF/CNPJ já cadastrado"}), 409
    
    # Campos opcionais
    telefone = request.json.get('telefone')
    email = request.json.get('email')
    endereco = request.json.get('endereco')
    
    # Gera identificador único
    identificador = Fornecedor.gerar_identificador()
    
    # Cria novo fornecedor
    novo_fornecedor = Fornecedor(
        nome=nome,
        cpf_cnpj=cpf_cnpj,
        identificador=identificador,
        telefone=telefone,
        email=email,
        endereco=endereco
    )
    
    db.session.add(novo_fornecedor)
    db.session.commit()
    
    return jsonify({
        "msg": "Fornecedor criado com sucesso",
        "fornecedor": {
            "id": novo_fornecedor.id,
            "nome": novo_fornecedor.nome,
            "cpf_cnpj": novo_fornecedor.cpf_cnpj,
            "identificador": novo_fornecedor.identificador,
            "telefone": novo_fornecedor.telefone,
            "email": novo_fornecedor.email,
            "endereco": novo_fornecedor.endereco,
            "data_cadastro": novo_fornecedor.data_cadastro.isoformat()
        }
    }), 201

@fornecedores_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_fornecedor(id):
    """Endpoint para atualizar um fornecedor existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    fornecedor = Fornecedor.query.get(id)
    
    if not fornecedor:
        return jsonify({"msg": "Fornecedor não encontrado"}), 404
    
    # Atualiza campos
    if 'nome' in request.json:
        fornecedor.nome = request.json['nome']
    
    if 'cpf_cnpj' in request.json:
        # Verifica se CPF/CNPJ já existe em outro fornecedor
        existing_fornecedor = Fornecedor.query.filter_by(cpf_cnpj=request.json['cpf_cnpj']).first()
        if existing_fornecedor and existing_fornecedor.id != id:
            return jsonify({"msg": "CPF/CNPJ já cadastrado para outro fornecedor"}), 409
        fornecedor.cpf_cnpj = request.json['cpf_cnpj']
    
    if 'telefone' in request.json:
        fornecedor.telefone = request.json['telefone']
    
    if 'email' in request.json:
        fornecedor.email = request.json['email']
    
    if 'endereco' in request.json:
        fornecedor.endereco = request.json['endereco']
    
    db.session.commit()
    
    return jsonify({
        "msg": "Fornecedor atualizado com sucesso",
        "fornecedor": {
            "id": fornecedor.id,
            "nome": fornecedor.nome,
            "cpf_cnpj": fornecedor.cpf_cnpj,
            "identificador": fornecedor.identificador,
            "telefone": fornecedor.telefone,
            "email": fornecedor.email,
            "endereco": fornecedor.endereco,
            "data_cadastro": fornecedor.data_cadastro.isoformat()
        }
    }), 200

@fornecedores_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def excluir_fornecedor(id):
    """Endpoint para excluir um fornecedor"""
    fornecedor = Fornecedor.query.get(id)
    
    if not fornecedor:
        return jsonify({"msg": "Fornecedor não encontrado"}), 404
    
    # Verifica se fornecedor possui lançamentos
    if fornecedor.lancamentos:
        return jsonify({"msg": "Não é possível excluir fornecedor com lançamentos associados"}), 400
    
    db.session.delete(fornecedor)
    db.session.commit()
    
    return jsonify({"msg": "Fornecedor excluído com sucesso"}), 200
