# API para TipoTratamento

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.tipo_tratamento import TipoTratamento, db

tipos_tratamento_bp = Blueprint('tipos_tratamento', __name__)

@tipos_tratamento_bp.route('/', methods=['GET'])
@jwt_required()
def listar_tipos_tratamento():
    """Endpoint para listar todos os tipos de tratamento"""
    tipos = TipoTratamento.query.filter_by(ativo=True).all()
    
    resultado = []
    for tipo in tipos:
        resultado.append(tipo.to_dict())
    
    return jsonify(resultado), 200

@tipos_tratamento_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_tipo_tratamento(id):
    """Endpoint para obter um tipo de tratamento específico"""
    tipo = TipoTratamento.query.get(id)
    
    if not tipo:
        return jsonify({"msg": "Tipo de tratamento não encontrado"}), 404
    
    return jsonify(tipo.to_dict()), 200

@tipos_tratamento_bp.route('/', methods=['POST'])
@jwt_required()
def criar_tipo_tratamento():
    """Endpoint para criar um novo tipo de tratamento"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    # Campos obrigatórios
    nome = request.json.get('nome', None)
    
    if not nome:
        return jsonify({"msg": "Nome é obrigatório"}), 400
    
    # Verifica se já existe um tipo com o mesmo nome
    tipo_existente = TipoTratamento.query.filter_by(nome=nome).first()
    if tipo_existente:
        return jsonify({"msg": "Já existe um tipo de tratamento com este nome"}), 400
    
    # Cria novo tipo de tratamento
    novo_tipo = TipoTratamento(
        nome=nome,
        descricao=request.json.get('descricao'),
        duracao_sessao_minutos=request.json.get('duracao_sessao_minutos'),
        ativo=True
    )
    
    db.session.add(novo_tipo)
    db.session.commit()
    
    return jsonify({
        "msg": "Tipo de tratamento criado com sucesso",
        "tipo_tratamento": novo_tipo.to_dict()
    }), 201

@tipos_tratamento_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_tipo_tratamento(id):
    """Endpoint para atualizar um tipo de tratamento existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    tipo = TipoTratamento.query.get(id)
    
    if not tipo:
        return jsonify({"msg": "Tipo de tratamento não encontrado"}), 404
    
    # Atualiza campos
    if 'nome' in request.json:
        # Verifica se já existe outro tipo com o mesmo nome
        tipo_existente = TipoTratamento.query.filter_by(nome=request.json['nome']).filter(TipoTratamento.id != id).first()
        if tipo_existente:
            return jsonify({"msg": "Já existe um tipo de tratamento com este nome"}), 400
        tipo.nome = request.json['nome']
    
    if 'descricao' in request.json:
        tipo.descricao = request.json['descricao']
    
    if 'duracao_sessao_minutos' in request.json:
        tipo.duracao_sessao_minutos = request.json['duracao_sessao_minutos']
    
    if 'ativo' in request.json:
        tipo.ativo = request.json['ativo']
    
    db.session.commit()
    
    return jsonify({
        "msg": "Tipo de tratamento atualizado com sucesso",
        "tipo_tratamento": tipo.to_dict()
    }), 200

@tipos_tratamento_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def excluir_tipo_tratamento(id):
    """Endpoint para excluir um tipo de tratamento (soft delete)"""
    tipo = TipoTratamento.query.get(id)
    
    if not tipo:
        return jsonify({"msg": "Tipo de tratamento não encontrado"}), 404
    
    # Verifica se há pacotes de tratamento vinculados
    if tipo.pacotes_tratamento:
        return jsonify({"msg": "Não é possível excluir tipo de tratamento com pacotes vinculados"}), 400
    
    # Soft delete - marca como inativo
    tipo.ativo = False
    db.session.commit()
    
    return jsonify({"msg": "Tipo de tratamento excluído com sucesso"}), 200

