from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.lancamento_financeiro import LancamentoFinanceiro, db
from src.models.contrato import Contrato
from src.models.fornecedor import Fornecedor
from datetime import datetime

lancamentos_bp = Blueprint('lancamentos', __name__)

@lancamentos_bp.route('/', methods=['GET'])
@jwt_required()
def listar_lancamentos():
    """Endpoint para listar todos os lançamentos financeiros"""
    lancamentos = LancamentoFinanceiro.query.all()
    
    resultado = []
    for lancamento in lancamentos:
        resultado.append({
            "id": lancamento.id,
            "tipo": lancamento.tipo,
            "contrato_id": lancamento.contrato_id,
            "contrato_identificador": lancamento.contrato.identificador_contrato if lancamento.contrato else None,
            "fornecedor_id": lancamento.fornecedor_id,
            "fornecedor_nome": lancamento.fornecedor.nome if lancamento.fornecedor else None,
            "data_vencimento": lancamento.data_vencimento.isoformat() if lancamento.data_vencimento else None,
            "data_pagamento": lancamento.data_pagamento.isoformat() if lancamento.data_pagamento else None,
            "valor": float(lancamento.valor),
            "status": lancamento.status,
            "numero_nota_fiscal": lancamento.numero_nota_fiscal,
            "observacoes": lancamento.observacoes,
            "data_criacao": lancamento.data_criacao.isoformat(),
            "data_atualizacao": lancamento.data_atualizacao.isoformat()
        })
    
    return jsonify(resultado), 200

@lancamentos_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_lancamento(id):
    """Endpoint para obter um lançamento financeiro específico"""
    lancamento = LancamentoFinanceiro.query.get(id)
    
    if not lancamento:
        return jsonify({"msg": "Lançamento não encontrado"}), 404
    
    return jsonify({
        "id": lancamento.id,
        "tipo": lancamento.tipo,
        "contrato_id": lancamento.contrato_id,
        "contrato_identificador": lancamento.contrato.identificador_contrato if lancamento.contrato else None,
        "fornecedor_id": lancamento.fornecedor_id,
        "fornecedor_nome": lancamento.fornecedor.nome if lancamento.fornecedor else None,
        "data_vencimento": lancamento.data_vencimento.isoformat() if lancamento.data_vencimento else None,
        "data_pagamento": lancamento.data_pagamento.isoformat() if lancamento.data_pagamento else None,
        "valor": float(lancamento.valor),
        "status": lancamento.status,
        "numero_nota_fiscal": lancamento.numero_nota_fiscal,
        "observacoes": lancamento.observacoes,
        "data_criacao": lancamento.data_criacao.isoformat(),
        "data_atualizacao": lancamento.data_atualizacao.isoformat()
    }), 200

@lancamentos_bp.route('/', methods=['POST'])
@jwt_required()
def criar_lancamento():
    """Endpoint para criar um novo lançamento financeiro"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    # Campos obrigatórios
    tipo = request.json.get('tipo', None)
    data_vencimento = request.json.get('data_vencimento', None)
    valor = request.json.get('valor', None)
    
    if not tipo or not data_vencimento or valor is None:
        return jsonify({"msg": "Tipo, data de vencimento e valor são obrigatórios"}), 400
    
    # Validações específicas por tipo
    if tipo == 'a_receber':
        contrato_id = request.json.get('contrato_id', None)
        if not contrato_id:
            return jsonify({"msg": "Lançamentos a receber devem estar vinculados a um contrato"}), 400
        
        # Verifica se contrato existe
        contrato = Contrato.query.get(contrato_id)
        if not contrato:
            return jsonify({"msg": "Contrato não encontrado"}), 404
    
    elif tipo == 'a_pagar':
        fornecedor_id = request.json.get('fornecedor_id', None)
        if not fornecedor_id:
            return jsonify({"msg": "Lançamentos a pagar devem estar vinculados a um fornecedor"}), 400
        
        # Verifica se fornecedor existe
        fornecedor = Fornecedor.query.get(fornecedor_id)
        if not fornecedor:
            return jsonify({"msg": "Fornecedor não encontrado"}), 404
    
    else:
        return jsonify({"msg": "Tipo deve ser 'a_receber' ou 'a_pagar'"}), 400
    
    try:
        # Converte string para data
        data_vencimento = datetime.fromisoformat(data_vencimento.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    try:
        # Converte valor para float
        valor = float(valor)
    except ValueError:
        return jsonify({"msg": "Valor deve ser um número"}), 400
    
    data_pagamento_str = request.json.get('data_pagamento')
    data_pagamento = None  # valor padrão

    if data_pagamento_str:
        try:
            data_pagamento = datetime.fromisoformat(data_pagamento_str.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    # Cria novo lançamento
    novo_lancamento = LancamentoFinanceiro(
        tipo=tipo,
        contrato_id=request.json.get('contrato_id'),
        fornecedor_id=request.json.get('fornecedor_id'),
        data_vencimento=data_vencimento,
        data_pagamento=data_pagamento,
        valor=valor,
        status=request.json.get('status', 'pendente'),
        numero_nota_fiscal=request.json.get('numero_nota_fiscal'),
        observacoes=request.json.get('observacoes')
    )
    
    # Valida regras de negócio
    valido, mensagem = novo_lancamento.validar()
    if not valido:
        return jsonify({"msg": mensagem}), 400
    
    db.session.add(novo_lancamento)
    db.session.commit()
    
    return jsonify({
        "msg": "Lançamento criado com sucesso",
        "lancamento": {
            "id": novo_lancamento.id,
            "tipo": novo_lancamento.tipo,
            "contrato_id": novo_lancamento.contrato_id,
            "fornecedor_id": novo_lancamento.fornecedor_id,
            "data_vencimento": novo_lancamento.data_vencimento.isoformat(),
            "data_pagamento": novo_lancamento.data_pagamento.isoformat() if novo_lancamento.data_pagamento else None,
            "valor": float(novo_lancamento.valor),
            "status": novo_lancamento.status,
            "numero_nota_fiscal": novo_lancamento.numero_nota_fiscal,
            "observacoes": novo_lancamento.observacoes,
            "data_criacao": novo_lancamento.data_criacao.isoformat(),
            "data_atualizacao": novo_lancamento.data_atualizacao.isoformat()
        }
    }), 201

@lancamentos_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_lancamento(id):
    """Endpoint para atualizar um lançamento financeiro existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    lancamento = LancamentoFinanceiro.query.get(id)
    
    if not lancamento:
        return jsonify({"msg": "Lançamento não encontrado"}), 404
    
    # Atualiza campos
    if 'tipo' in request.json:
        lancamento.tipo = request.json['tipo']
    
    if 'contrato_id' in request.json:
        if request.json['contrato_id'] is not None:
            contrato = Contrato.query.get(request.json['contrato_id'])
            if not contrato:
                return jsonify({"msg": "Contrato não encontrado"}), 404
        lancamento.contrato_id = request.json['contrato_id']
    
    if 'fornecedor_id' in request.json:
        if request.json['fornecedor_id'] is not None:
            fornecedor = Fornecedor.query.get(request.json['fornecedor_id'])
            if not fornecedor:
                return jsonify({"msg": "Fornecedor não encontrado"}), 404
        lancamento.fornecedor_id = request.json['fornecedor_id']
    
    if 'data_vencimento' in request.json:
        try:
            lancamento.data_vencimento = datetime.fromisoformat(request.json['data_vencimento'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    if 'data_pagamento' in request.json:
        if request.json['data_pagamento']:
            try:
                lancamento.data_pagamento = datetime.fromisoformat(request.json['data_pagamento'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
        else:
            lancamento.data_pagamento = None
    
    if 'valor' in request.json:
        try:
            lancamento.valor = float(request.json['valor'])
        except ValueError:
            return jsonify({"msg": "Valor deve ser um número"}), 400
    
    if 'status' in request.json:
        lancamento.status = request.json['status']
    
    if 'numero_nota_fiscal' in request.json:
        lancamento.numero_nota_fiscal = request.json['numero_nota_fiscal']
    
    if 'observacoes' in request.json:
        lancamento.observacoes = request.json['observacoes']
    
    # Valida regras de negócio
    valido, mensagem = lancamento.validar()
    if not valido:
        return jsonify({"msg": mensagem}), 400
    
    db.session.commit()
    
    return jsonify({
        "msg": "Lançamento atualizado com sucesso",
        "lancamento": {
            "id": lancamento.id,
            "tipo": lancamento.tipo,
            "contrato_id": lancamento.contrato_id,
            "fornecedor_id": lancamento.fornecedor_id,
            "data_vencimento": lancamento.data_vencimento.isoformat() if lancamento.data_vencimento else None,
            "data_pagamento": lancamento.data_pagamento.isoformat() if lancamento.data_pagamento else None,
            "valor": float(lancamento.valor),
            "status": lancamento.status,
            "numero_nota_fiscal": lancamento.numero_nota_fiscal,
            "observacoes": lancamento.observacoes,
            "data_criacao": lancamento.data_criacao.isoformat(),
            "data_atualizacao": lancamento.data_atualizacao.isoformat()
        }
    }), 200

@lancamentos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def excluir_lancamento(id):
    """Endpoint para excluir um lançamento financeiro"""
    lancamento = LancamentoFinanceiro.query.get(id)
    
    if not lancamento:
        return jsonify({"msg": "Lançamento não encontrado"}), 404
    
    db.session.delete(lancamento)
    db.session.commit()
    
    return jsonify({"msg": "Lançamento excluído com sucesso"}), 200

@lancamentos_bp.route('/contrato/<int:contrato_id>', methods=['GET'])
@jwt_required()
def listar_lancamentos_por_contrato(contrato_id):
    """Endpoint para listar lançamentos de um contrato específico"""
    # Verifica se contrato existe
    contrato = Contrato.query.get(contrato_id)
    if not contrato:
        return jsonify({"msg": "Contrato não encontrado"}), 404
    
    lancamentos = LancamentoFinanceiro.query.filter_by(contrato_id=contrato_id).all()
    
    resultado = []
    for lancamento in lancamentos:
        resultado.append({
            "id": lancamento.id,
            "tipo": lancamento.tipo,
            "contrato_id": lancamento.contrato_id,
            "data_vencimento": lancamento.data_vencimento.isoformat() if lancamento.data_vencimento else None,
            "data_pagamento": lancamento.data_pagamento.isoformat() if lancamento.data_pagamento else None,
            "valor": float(lancamento.valor),
            "status": lancamento.status,
            "numero_nota_fiscal": lancamento.numero_nota_fiscal,
            "observacoes": lancamento.observacoes,
            "data_criacao": lancamento.data_criacao.isoformat(),
            "data_atualizacao": lancamento.data_atualizacao.isoformat()
        })
    
    return jsonify(resultado), 200

@lancamentos_bp.route('/fornecedor/<int:fornecedor_id>', methods=['GET'])
@jwt_required()
def listar_lancamentos_por_fornecedor(fornecedor_id):
    """Endpoint para listar lançamentos de um fornecedor específico"""
    # Verifica se fornecedor existe
    fornecedor = Fornecedor.query.get(fornecedor_id)
    if not fornecedor:
        return jsonify({"msg": "Fornecedor não encontrado"}), 404
    
    lancamentos = LancamentoFinanceiro.query.filter_by(fornecedor_id=fornecedor_id).all()
    
    resultado = []
    for lancamento in lancamentos:
        resultado.append({
            "id": lancamento.id,
            "tipo": lancamento.tipo,
            "fornecedor_id": lancamento.fornecedor_id,
            "data_vencimento": lancamento.data_vencimento.isoformat() if lancamento.data_vencimento else None,
            "data_pagamento": lancamento.data_pagamento.isoformat() if lancamento.data_pagamento else None,
            "valor": float(lancamento.valor),
            "status": lancamento.status,
            "numero_nota_fiscal": lancamento.numero_nota_fiscal,
            "observacoes": lancamento.observacoes,
            "data_criacao": lancamento.data_criacao.isoformat(),
            "data_atualizacao": lancamento.data_atualizacao.isoformat()
        })
    
    return jsonify(resultado), 200
