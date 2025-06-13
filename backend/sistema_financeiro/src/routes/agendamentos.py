from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.agendamento import Agendamento, db
from src.models.paciente import Paciente
from src.models.procedimento import Procedimento
from src.models.equipe import Equipe
from src.models.local_atendimento import LocalAtendimento
from src.models.categoria_procedimento import CategoriaProcedimento
from src.models.refeicao import Refeicao
from src.models.contrato import Contrato
from datetime import datetime, date, time

agendamentos_bp = Blueprint("agendamentos", __name__)

@agendamentos_bp.route("/", methods=["GET"])
@jwt_required()
def listar_agendamentos():
    """Endpoint para listar todos os agendamentos"""
    agendamentos = Agendamento.query.all()
    agendamento = Agendamento.query.options(db.joinedload(Agendamento.paciente)).get(id)
    agendamento = Agendamento.query.options(db.joinedload(Agendamento.procedimento)).get(id)
    agendamento = Agendamento.query.options(db.joinedload(Agendamento.equipe)).get(id)
    agendamento = Agendamento.query.options(db.joinedload(Agendamento.local_atendimento)).get(id)
    agendamento = Agendamento.query.options(db.joinedload(Agendamento.categoria)).get(id)
    
    resultado = []
    for agendamento in agendamentos:
        resultado.append({
            "id": agendamento.id,
            "paciente_id": agendamento.paciente_id,
            "paciente_nome": agendamento.paciente.nome,
            "data_agendamento": agendamento.data_agendamento.isoformat() if agendamento.data_agendamento else None,
            "procedimento_id": agendamento.procedimento_id,
            "procedimento_nome": agendamento.procedimento.nome,
            "grau_calvicie": agendamento.grau_calvicie,
            "equipe_id": agendamento.equipe_id,
            "equipe_nome": agendamento.equipe.nome,
            "local_atendimento_id": agendamento.local_atendimento_id,
            "local_atendimento_nome": agendamento.local_atendimento.nome,
            "horario_inicio": agendamento.horario_inicio.isoformat() if agendamento.horario_inicio else None,
            "categoria_id": agendamento.categoria_id,
            "categoria_nome": agendamento.categoria.nome,
            "valor_geral_venda": agendamento.valor_geral_venda,
            "valor_pago": agendamento.valor_pago,
            "saldo_devedor": agendamento.saldo_devedor,
            "forma_pagamento": agendamento.forma_pagamento,
            "contrato_assinado": agendamento.contrato_assinado,
            "exames": agendamento.exames,
            "comunicacao_d7": agendamento.comunicacao_d7,
            "comunicacao_d2": agendamento.comunicacao_d2,
            "almoco_escolhido_id": agendamento.almoco_escolhido_id,
            "termo_marcacao": agendamento.termo_marcacao,
            "termo_alta": agendamento.termo_alta,
            "comunicacao_d1": agendamento.comunicacao_d1,
            "observacoes": agendamento.observacoes,
            "acompanhante": agendamento.acompanhante,
            "telefone_acompanhante": agendamento.telefone_acompanhante,
            "data_cadastro": agendamento.data_cadastro.isoformat()
        })
    
    return jsonify(resultado), 200

@agendamentos_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_agendamento(id):
    """Endpoint para obter um agendamento específico"""
    agendamento = Agendamento.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento não encontrado"}), 404
    
    return jsonify({
        "id": agendamento.id,
        "paciente_id": agendamento.paciente_id,
        "data_agendamento": agendamento.data_agendamento.isoformat() if agendamento.data_agendamento else None,
        "procedimento_id": agendamento.procedimento_id,
        "grau_calvicie": agendamento.grau_calvicie,
        "equipe_id": agendamento.equipe_id,
        "local_atendimento_id": agendamento.local_atendimento_id,
        "horario_inicio": agendamento.horario_inicio.isoformat() if agendamento.horario_inicio else None,
        "categoria_id": agendamento.categoria_id,
        "valor_geral_venda": agendamento.valor_geral_venda,
        "valor_pago": agendamento.valor_pago,
        "saldo_devedor": agendamento.saldo_devedor,
        "forma_pagamento": agendamento.forma_pagamento,
        "contrato_assinado": agendamento.contrato_assinado,
        "exames": agendamento.exames,
        "comunicacao_d7": agendamento.comunicacao_d7,
        "comunicacao_d2": agendamento.comunicacao_d2,
        "almoco_escolhido_id": agendamento.almoco_escolhido_id,
        "termo_marcacao": agendamento.termo_marcacao,
        "termo_alta": agendamento.termo_alta,
        "comunicacao_d1": agendamento.comunicacao_d1,
        "observacoes": agendamento.observacoes,
        "acompanhante": agendamento.acompanhante,
        "telefone_acompanhante": agendamento.telefone_acompanhante,
        "data_cadastro": agendamento.data_cadastro.isoformat()
    }), 200

@agendamentos_bp.route("/", methods=["POST"])
@jwt_required()
def criar_agendamento():
    """Endpoint para criar um novo agendamento"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    data = request.get_json()
    
    # Campos obrigatórios
    paciente_id = data.get("paciente_id")
    data_agendamento_str = data.get("data_agendamento")
    procedimento_id = data.get("procedimento_id")
    equipe_id = data.get("equipe_id")
    local_atendimento_id = data.get("local_atendimento_id")
    horario_inicio_str = data.get("horario_inicio")
    categoria_id = data.get("categoria_id")
    
    if not all([paciente_id, data_agendamento_str, procedimento_id, equipe_id, local_atendimento_id, horario_inicio_str, categoria_id]):
        return jsonify({"msg": "Campos obrigatórios ausentes"}), 400
    
    try:
        data_agendamento = date.fromisoformat(data_agendamento_str)
        horario_inicio = time.fromisoformat(horario_inicio_str)
    except ValueError:
        return jsonify({"msg": "Formato de data ou hora inválido. Use ISO 8601 (YYYY-MM-DD para data, HH:MM:SS para hora)"}), 400

    # Validações de IDs de chave estrangeira
    if not Paciente.query.get(paciente_id):
        return jsonify({"msg": "Paciente não encontrado"}), 404
    if not Procedimento.query.get(procedimento_id):
        return jsonify({"msg": "Procedimento não encontrado"}), 404
    if not Equipe.query.get(equipe_id):
        return jsonify({"msg": "Equipe não encontrada"}), 404
    if not LocalAtendimento.query.get(local_atendimento_id):
        return jsonify({"msg": "Local de Atendimento não encontrado"}), 404
    if not CategoriaProcedimento.query.get(categoria_id):
        return jsonify({"msg": "Categoria de Procedimento não encontrada"}), 404

    almoco_escolhido_id = data.get("almoco_escolhido_id")
    if almoco_escolhido_id and not Refeicao.query.get(almoco_escolhido_id):
        return jsonify({"msg": "Refeição não encontrada"}), 404

    # Calcula saldo devedor
    valor_geral_venda = data.get("valor_geral_venda", 0.0)
    valor_pago = data.get("valor_pago", 0.0)
    saldo_devedor = valor_geral_venda - valor_pago

    novo_agendamento = Agendamento(
        paciente_id=paciente_id,
        data_agendamento=data_agendamento,
        procedimento_id=procedimento_id,
        grau_calvicie=data.get("grau_calvicie"),
        equipe_id=equipe_id,
        local_atendimento_id=local_atendimento_id,
        horario_inicio=horario_inicio,
        categoria_id=categoria_id,
        valor_geral_venda=valor_geral_venda,
        valor_pago=valor_pago,
        saldo_devedor=saldo_devedor,
        forma_pagamento=data.get("forma_pagamento"),
        contrato_assinado=data.get("contrato_assinado", False),
        exames=data.get("exames", False),
        comunicacao_d7=data.get("comunicacao_d7", False),
        comunicacao_d2=data.get("comunicacao_d2", False),
        almoco_escolhido_id=almoco_escolhido_id,
        termo_marcacao=data.get("termo_marcacao", False),
        termo_alta=data.get("termo_alta", False),
        comunicacao_d1=data.get("comunicacao_d1", False),
        observacoes=data.get("observacoes"),
        acompanhante=data.get("acompanhante"),
        telefone_acompanhante=data.get("telefone_acompanhante")
    )
    
    db.session.add(novo_agendamento)
    db.session.commit()
    
    return jsonify({
        "id": novo_agendamento.id,
        "paciente_id": novo_agendamento.paciente_id,
        "data_agendamento": novo_agendamento.data_agendamento.isoformat(),
        "procedimento_id": novo_agendamento.procedimento_id,
        "grau_calvicie": novo_agendamento.grau_calvicie,
        "equipe_id": novo_agendamento.equipe_id,
        "local_atendimento_id": novo_agendamento.local_atendimento_id,
        "horario_inicio": novo_agendamento.horario_inicio.isoformat(),
        "categoria_id": novo_agendamento.categoria_id,
        "valor_geral_venda": novo_agendamento.valor_geral_venda,
        "valor_pago": novo_agendamento.valor_pago,
        "saldo_devedor": novo_agendamento.saldo_devedor,
        "forma_pagamento": novo_agendamento.forma_pagamento,
        "contrato_assinado": novo_agendamento.contrato_assinado,
        "exames": novo_agendamento.exames,
        "comunicacao_d7": novo_agendamento.comunicacao_d7,
        "comunicacao_d2": novo_agendamento.comunicacao_d2,
        "almoco_escolhido_id": novo_agendamento.almoco_escolhido_id,
        "termo_marcacao": novo_agendamento.termo_marcacao,
        "termo_alta": novo_agendamento.termo_alta,
        "comunicacao_d1": novo_agendamento.comunicacao_d1,
        "observacoes": novo_agendamento.observacoes,
        "acompanhante": novo_agendamento.acompanhante,
        "telefone_acompanhante": novo_agendamento.telefone_acompanhante,
        "data_cadastro": novo_agendamento.data_cadastro.isoformat()
    }), 201

@agendamentos_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_agendamento(id):
    """Endpoint para atualizar um agendamento existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    agendamento = Agendamento.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento não encontrado"}), 404
    
    data = request.get_json()
    
    # Atualiza campos
    if "paciente_id" in data:
        if not Paciente.query.get(data["paciente_id"]):
            return jsonify({"msg": "Paciente não encontrado"}), 404
        agendamento.paciente_id = data["paciente_id"]
    
    if "data_agendamento" in data:
        try:
            agendamento.data_agendamento = date.fromisoformat(data["data_agendamento"])
        except ValueError:
            return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
            
    if "procedimento_id" in data:
        if not Procedimento.query.get(data["procedimento_id"]):
            return jsonify({"msg": "Procedimento não encontrado"}), 404
        agendamento.procedimento_id = data["procedimento_id"]
        
    if "grau_calvicie" in data:
        agendamento.grau_calvicie = data["grau_calvicie"]
        
    if "equipe_id" in data:
        if not Equipe.query.get(data["equipe_id"]):
            return jsonify({"msg": "Equipe não encontrada"}), 404
        agendamento.equipe_id = data["equipe_id"]
        
    if "local_atendimento_id" in data:
        if not LocalAtendimento.query.get(data["local_atendimento_id"]):
            return jsonify({"msg": "Local de Atendimento não encontrado"}), 404
        agendamento.local_atendimento_id = data["local_atendimento_id"]
        
    if "horario_inicio" in data:
        try:
            agendamento.horario_inicio = time.fromisoformat(data["horario_inicio"])
        except ValueError:
            return jsonify({"msg": "Formato de hora inválido. Use ISO 8601 (HH:MM:SS)"}), 400
            
    if "categoria_id" in data:
        if not CategoriaProcedimento.query.get(data["categoria_id"]):
            return jsonify({"msg": "Categoria de Procedimento não encontrada"}), 404
        agendamento.categoria_id = data["categoria_id"]
        
    if "valor_geral_venda" in data:
        agendamento.valor_geral_venda = data["valor_geral_venda"]
        
    if "valor_pago" in data:
        agendamento.valor_pago = data["valor_pago"]
        
    # Recalcula saldo devedor se valor_geral_venda ou valor_pago forem atualizados
    if "valor_geral_venda" in data or "valor_pago" in data:
        agendamento.saldo_devedor = agendamento.valor_geral_venda - agendamento.valor_pago
        
    if "forma_pagamento" in data:
        agendamento.forma_pagamento = data["forma_pagamento"]
        
        
    if "contrato_assinado" in data:
        agendamento.contrato_assinado = data["contrato_assinado"]
        
    if "exames" in data:
        agendamento.exames = data["exames"]
        
    if "comunicacao_d7" in data:
        agendamento.comunicacao_d7 = data["comunicacao_d7"]
        
    if "comunicacao_d2" in data:
        agendamento.comunicacao_d2 = data["comunicacao_d2"]
        
    if "almoco_escolhido_id" in data:
        if data["almoco_escolhido_id"] and not Refeicao.query.get(data["almoco_escolhido_id"]):
            return jsonify({"msg": "Refeição não encontrada"}), 404
        agendamento.almoco_escolhido_id = data["almoco_escolhido_id"]
        
    if "termo_marcacao" in data:
        agendamento.termo_marcacao = data["termo_marcacao"]
        
    if "termo_alta" in data:
        agendamento.termo_alta = data["termo_alta"]
        
    if "comunicacao_d1" in data:
        agendamento.comunicacao_d1 = data["comunicacao_d1"]
        
    if "observacoes" in data:
        agendamento.observacoes = data["observacoes"]
        
    if "acompanhante" in data:
        agendamento.acompanhante = data["acompanhante"]
        
    if "telefone_acompanhante" in data:
        agendamento.telefone_acompanhante = data["telefone_acompanhante"]
        
    db.session.commit()
    
    return jsonify({
        "id": agendamento.id,
        "paciente_id": agendamento.paciente_id,
        "data_agendamento": agendamento.data_agendamento.isoformat() if agendamento.data_agendamento else None,
        "procedimento_id": agendamento.procedimento_id,
        "grau_calvicie": agendamento.grau_calvicie,
        "equipe_id": agendamento.equipe_id,
        "local_atendimento_id": agendamento.local_atendimento_id,
        "horario_inicio": agendamento.horario_inicio.isoformat() if agendamento.horario_inicio else None,
        "categoria_id": agendamento.categoria_id,
        "valor_geral_venda": agendamento.valor_geral_venda,
        "valor_pago": agendamento.valor_pago,
        "saldo_devedor": agendamento.saldo_devedor,
        "forma_pagamento": agendamento.forma_pagamento,
        "contrato_assinado": agendamento.contrato_assinado,
        "exames": agendamento.exames,
        "comunicacao_d7": agendamento.comunicacao_d7,
        "comunicacao_d2": agendamento.comunicacao_d2,
        "almoco_escolhido_id": agendamento.almoco_escolhido_id,
        "termo_marcacao": agendamento.termo_marcacao,
        "termo_alta": agendamento.termo_alta,
        "comunicacao_d1": agendamento.comunicacao_d1,
        "observacoes": agendamento.observacoes,
        "acompanhante": agendamento.acompanhante,
        "telefone_acompanhante": agendamento.telefone_acompanhante,
        "data_cadastro": agendamento.data_cadastro.isoformat()
    }), 200

@agendamentos_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_agendamento(id):
    """Endpoint para deletar um agendamento"""
    agendamento = Agendamento.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento não encontrado"}), 404
        
    db.session.delete(agendamento)
    db.session.commit()
    
    return jsonify({"msg": "Agendamento deletado com sucesso"}), 200


@agendamentos_bp.route("/<int:id>/registrar-servico", methods=["POST"])
@jwt_required()
def registrar_servico(id):
    """Endpoint para registrar um serviço específico em um agendamento"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    agendamento = Agendamento.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento não encontrado"}), 404
    
    data = request.get_json()
    servico = data.get("servico")
    
    if not servico:
        return jsonify({"msg": "Serviço não especificado"}), 400
    
    # Mapeamento dos serviços para campos do modelo
    servicos_map = {
        "exames": "exames",
        "termo_marcacao": "termo_marcacao",
        "termo_alta": "termo_alta",
        "comunicacao_d7": "comunicacao_d7",
        "comunicacao_d2": "comunicacao_d2",
        "comunicacao_d1": "comunicacao_d1"
    }
    
    if servico not in servicos_map:
        return jsonify({"msg": "Serviço inválido"}), 400
    
    # Atualiza o campo correspondente
    setattr(agendamento, servicos_map[servico], True)
    
    db.session.commit()
    
    return jsonify({
        "msg": f"Serviço {servico} registrado com sucesso",
        "agendamento": {
            "id": agendamento.id,
            servico: True
        }
    }), 200

@agendamentos_bp.route("/por-periodo", methods=["GET"])
@jwt_required()
def listar_agendamentos_por_periodo():
    start_date_str = request.args.get('start')
    end_date_str = request.args.get('end')
    
    if not start_date_str or not end_date_str:
        return jsonify({"msg": "Parâmetros 'start' e 'end' são obrigatórios"}), 400
    
    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
    except ValueError:
        return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400

    agendamentos = Agendamento.query.filter(
        Agendamento.data_agendamento >= start_date,
        Agendamento.data_agendamento <= end_date
    ).options(
        db.joinedload(Agendamento.paciente),
        db.joinedload(Agendamento.procedimento),
        db.joinedload(Agendamento.equipe),
        db.joinedload(Agendamento.local_atendimento)
    ).all()
    
    eventos = []
    for agendamento in agendamentos:
        eventos.append({
            "id": agendamento.id,
            "title": f"{agendamento.paciente.nome} - {agendamento.procedimento.nome}",
            "start": f"{agendamento.data_agendamento.isoformat()}T{agendamento.horario_inicio.isoformat()}",
            "extendedProps": {
                "paciente": agendamento.paciente.nome,
                "procedimento": agendamento.procedimento.nome,
                "equipe": agendamento.equipe.nome,
                "local": agendamento.local_atendimento.nome,
                "valor": agendamento.valor_geral_venda,
                "status_pagamento": "Pago" if agendamento.valor_pago >= agendamento.valor_geral_venda else "Parcial" if agendamento.valor_pago > 0 else "Pendente"
            }
        })
    
    return jsonify(eventos), 200