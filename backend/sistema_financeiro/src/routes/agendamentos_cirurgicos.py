# API para AgendamentoCirurgico (renomeado do agendamentos.py original)

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.agendamento_cirurgico import AgendamentoCirurgico, db
from src.models.paciente import Paciente
from src.models.procedimento import Procedimento
from src.models.equipe import Equipe
from src.models.local_atendimento import LocalAtendimento
from src.models.categoria_procedimento import CategoriaProcedimento
from src.models.refeicao import Refeicao
from datetime import datetime, time

agendamentos_cirurgicos_bp = Blueprint('agendamentos_cirurgicos', __name__)

@agendamentos_cirurgicos_bp.route('/', methods=['GET'])
@jwt_required()
def listar_agendamentos_cirurgicos():
    """Endpoint para listar todos os agendamentos cirúrgicos"""
    agendamentos = AgendamentoCirurgico.query.all()
    
    resultado = []
    for agendamento in agendamentos:
        resultado.append(agendamento.to_dict())
    
    return jsonify(resultado), 200

@agendamentos_cirurgicos_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_agendamento_cirurgico(id):
    """Endpoint para obter um agendamento cirúrgico específico"""
    agendamento = AgendamentoCirurgico.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento cirúrgico não encontrado"}), 404
    
    return jsonify(agendamento.to_dict()), 200

@agendamentos_cirurgicos_bp.route('/paciente/<int:paciente_id>', methods=['GET'])
@jwt_required()
def listar_agendamentos_por_paciente(paciente_id):
    """Endpoint para listar agendamentos cirúrgicos de um paciente específico"""
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    agendamentos = AgendamentoCirurgico.query.filter_by(paciente_id=paciente_id).all()
    
    resultado = []
    for agendamento in agendamentos:
        resultado.append(agendamento.to_dict())
    
    return jsonify(resultado), 200

@agendamentos_cirurgicos_bp.route('/', methods=['POST'])
@jwt_required()
def criar_agendamento_cirurgico():
    """Endpoint para criar um novo agendamento cirúrgico"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    # Campos obrigatórios
    paciente_id = request.json.get('paciente_id', None)
    data_agendamento = request.json.get('data_agendamento', None)
    procedimento_id = request.json.get('procedimento_id', None)
    grau_calvicie = request.json.get('grau_calvicie', None)
    equipe_id = request.json.get('equipe_id', None)
    local_atendimento_id = request.json.get('local_atendimento_id', None)
    horario_inicio = request.json.get('horario_inicio', None)
    categoria_id = request.json.get('categoria_id', None)
    valor_geral_venda = request.json.get('valor_geral_venda', None)
    
    if not all([paciente_id, data_agendamento, procedimento_id, grau_calvicie, equipe_id, 
                local_atendimento_id, horario_inicio, categoria_id, valor_geral_venda]):
        return jsonify({"msg": "Todos os campos obrigatórios devem ser preenchidos"}), 400
    
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    # Verifica se procedimento existe
    procedimento = Procedimento.query.get(procedimento_id)
    if not procedimento:
        return jsonify({"msg": "Procedimento não encontrado"}), 404
    
    # Verifica se equipe existe
    equipe = Equipe.query.get(equipe_id)
    if not equipe:
        return jsonify({"msg": "Equipe não encontrada"}), 404
    
    # Verifica se local de atendimento existe
    local = LocalAtendimento.query.get(local_atendimento_id)
    if not local:
        return jsonify({"msg": "Local de atendimento não encontrado"}), 404
    
    # Verifica se categoria existe
    categoria = CategoriaProcedimento.query.get(categoria_id)
    if not categoria:
        return jsonify({"msg": "Categoria de procedimento não encontrada"}), 404
    
    try:
        # Converte string para data
        data_agend = datetime.fromisoformat(data_agendamento.replace('Z', '+00:00')).date()
    except ValueError:
        return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    try:
        # Converte string para time
        horario = datetime.strptime(horario_inicio, '%H:%M').time()
    except ValueError:
        return jsonify({"msg": "Formato de horário inválido. Use HH:MM"}), 400
    
    # Processa horário de fim se fornecido
    horario_fim_obj = None
    if 'horario_fim' in request.json and request.json['horario_fim']:
        try:
            horario_fim_obj = datetime.strptime(request.json['horario_fim'], '%H:%M').time()
        except ValueError:
            return jsonify({"msg": "Formato de horário de fim inválido. Use HH:MM"}), 400
    
    # Processa refeição se fornecida
    almoco_escolhido_id = request.json.get('almoco_escolhido_id')
    if almoco_escolhido_id:
        refeicao = Refeicao.query.get(almoco_escolhido_id)
        if not refeicao:
            return jsonify({"msg": "Refeição não encontrada"}), 404
    
    try:
        # Converte valores para tipos apropriados
        valor_geral = float(valor_geral_venda)
        valor_pago = float(request.json.get('valor_pago', 0))
    except ValueError:
        return jsonify({"msg": "Valores devem ser números"}), 400
    
    # Calcula saldo devedor
    saldo_devedor = valor_geral - valor_pago
    
    # Cria novo agendamento cirúrgico
    novo_agendamento = AgendamentoCirurgico(
        paciente_id=paciente_id,
        data_agendamento=data_agend,
        procedimento_id=procedimento_id,
        grau_calvicie=grau_calvicie,
        equipe_id=equipe_id,
        local_atendimento_id=local_atendimento_id,
        horario_inicio=horario,
        horario_fim=horario_fim_obj,
        categoria_id=categoria_id,
        valor_geral_venda=valor_geral,
        valor_pago=valor_pago,
        saldo_devedor=saldo_devedor,
        forma_pagamento=request.json.get('forma_pagamento'),
        contrato_assinado=request.json.get('contrato_assinado', False),
        exames=request.json.get('exames', False),
        comunicacao_d7=request.json.get('comunicacao_d7', False),
        comunicacao_d2=request.json.get('comunicacao_d2', False),
        almoco_escolhido_id=almoco_escolhido_id,
        termo_marcacao=request.json.get('termo_marcacao', False),
        termo_alta=request.json.get('termo_alta', False),
        comunicacao_d1=request.json.get('comunicacao_d1', False),
        observacoes=request.json.get('observacoes'),
        acompanhante=request.json.get('acompanhante'),
        telefone_acompanhante=request.json.get('telefone_acompanhante'),
        status_cirurgia=request.json.get('status_cirurgia', 'agendada')
    )
    
    # Valida regras de negócio
    valido, mensagem = novo_agendamento.validar()
    if not valido:
        return jsonify({"msg": mensagem}), 400
    
    db.session.add(novo_agendamento)
    db.session.commit()
    
    return jsonify({
        "msg": "Agendamento cirúrgico criado com sucesso",
        "agendamento_cirurgico": novo_agendamento.to_dict()
    }), 201

@agendamentos_cirurgicos_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_agendamento_cirurgico(id):
    """Endpoint para atualizar um agendamento cirúrgico existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    agendamento = AgendamentoCirurgico.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento cirúrgico não encontrado"}), 404
    
    # Atualiza campos
    if 'paciente_id' in request.json:
        paciente = Paciente.query.get(request.json['paciente_id'])
        if not paciente:
            return jsonify({"msg": "Paciente não encontrado"}), 404
        agendamento.paciente_id = request.json['paciente_id']
    
    if 'data_agendamento' in request.json:
        try:
            agendamento.data_agendamento = datetime.fromisoformat(request.json['data_agendamento'].replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    if 'procedimento_id' in request.json:
        procedimento = Procedimento.query.get(request.json['procedimento_id'])
        if not procedimento:
            return jsonify({"msg": "Procedimento não encontrado"}), 404
        agendamento.procedimento_id = request.json['procedimento_id']
    
    if 'grau_calvicie' in request.json:
        agendamento.grau_calvicie = request.json['grau_calvicie']
    
    if 'equipe_id' in request.json:
        equipe = Equipe.query.get(request.json['equipe_id'])
        if not equipe:
            return jsonify({"msg": "Equipe não encontrada"}), 404
        agendamento.equipe_id = request.json['equipe_id']
    
    if 'local_atendimento_id' in request.json:
        local = LocalAtendimento.query.get(request.json['local_atendimento_id'])
        if not local:
            return jsonify({"msg": "Local de atendimento não encontrado"}), 404
        agendamento.local_atendimento_id = request.json['local_atendimento_id']
    
    if 'horario_inicio' in request.json:
        try:
            agendamento.horario_inicio = datetime.strptime(request.json['horario_inicio'], '%H:%M').time()
        except ValueError:
            return jsonify({"msg": "Formato de horário inválido. Use HH:MM"}), 400
    
    if 'horario_fim' in request.json:
        if request.json['horario_fim']:
            try:
                agendamento.horario_fim = datetime.strptime(request.json['horario_fim'], '%H:%M').time()
            except ValueError:
                return jsonify({"msg": "Formato de horário de fim inválido. Use HH:MM"}), 400
        else:
            agendamento.horario_fim = None
    
    if 'categoria_id' in request.json:
        categoria = CategoriaProcedimento.query.get(request.json['categoria_id'])
        if not categoria:
            return jsonify({"msg": "Categoria de procedimento não encontrada"}), 404
        agendamento.categoria_id = request.json['categoria_id']
    
    if 'valor_geral_venda' in request.json:
        try:
            agendamento.valor_geral_venda = float(request.json['valor_geral_venda'])
        except ValueError:
            return jsonify({"msg": "Valor geral de venda deve ser um número"}), 400
    
    if 'valor_pago' in request.json:
        try:
            agendamento.valor_pago = float(request.json['valor_pago'])
        except ValueError:
            return jsonify({"msg": "Valor pago deve ser um número"}), 400
    
    # Recalcula saldo devedor
    agendamento.saldo_devedor = agendamento.valor_geral_venda - agendamento.valor_pago
    
    if 'forma_pagamento' in request.json:
        agendamento.forma_pagamento = request.json['forma_pagamento']
    
    if 'contrato_assinado' in request.json:
        agendamento.contrato_assinado = request.json['contrato_assinado']
    
    if 'exames' in request.json:
        agendamento.exames = request.json['exames']
    
    if 'comunicacao_d7' in request.json:
        agendamento.comunicacao_d7 = request.json['comunicacao_d7']
    
    if 'comunicacao_d2' in request.json:
        agendamento.comunicacao_d2 = request.json['comunicacao_d2']
    
    if 'almoco_escolhido_id' in request.json:
        if request.json['almoco_escolhido_id']:
            refeicao = Refeicao.query.get(request.json['almoco_escolhido_id'])
            if not refeicao:
                return jsonify({"msg": "Refeição não encontrada"}), 404
        agendamento.almoco_escolhido_id = request.json['almoco_escolhido_id']
    
    if 'termo_marcacao' in request.json:
        agendamento.termo_marcacao = request.json['termo_marcacao']
    
    if 'termo_alta' in request.json:
        agendamento.termo_alta = request.json['termo_alta']
    
    if 'comunicacao_d1' in request.json:
        agendamento.comunicacao_d1 = request.json['comunicacao_d1']
    
    if 'observacoes' in request.json:
        agendamento.observacoes = request.json['observacoes']
    
    if 'acompanhante' in request.json:
        agendamento.acompanhante = request.json['acompanhante']
    
    if 'telefone_acompanhante' in request.json:
        agendamento.telefone_acompanhante = request.json['telefone_acompanhante']
    
    if 'status_cirurgia' in request.json:
        agendamento.status_cirurgia = request.json['status_cirurgia']
    
    # Valida regras de negócio
    valido, mensagem = agendamento.validar()
    if not valido:
        return jsonify({"msg": mensagem}), 400
    
    db.session.commit()
    
    return jsonify({
        "msg": "Agendamento cirúrgico atualizado com sucesso",
        "agendamento_cirurgico": agendamento.to_dict()
    }), 200

@agendamentos_cirurgicos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def excluir_agendamento_cirurgico(id):
    """Endpoint para excluir um agendamento cirúrgico"""
    agendamento = AgendamentoCirurgico.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento cirúrgico não encontrado"}), 404
    
    db.session.delete(agendamento)
    db.session.commit()
    
    return jsonify({"msg": "Agendamento cirúrgico excluído com sucesso"}), 200

@agendamentos_cirurgicos_bp.route('/<int:id>/registrar-servico', methods=['POST'])
@jwt_required()
def registrar_servico(id):
    """Endpoint para registrar um serviço específico no agendamento"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    agendamento = AgendamentoCirurgico.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento cirúrgico não encontrado"}), 404
    
    servico = request.json.get('servico')
    if not servico:
        return jsonify({"msg": "Serviço deve ser especificado"}), 400
    
    # Mapeia serviços para campos do modelo
    servicos_validos = {
        'exames': 'exames',
        'termo_marcacao': 'termo_marcacao',
        'termo_alta': 'termo_alta',
        'comunicacao_d7': 'comunicacao_d7',
        'comunicacao_d2': 'comunicacao_d2',
        'comunicacao_d1': 'comunicacao_d1'
    }
    
    if servico not in servicos_validos:
        return jsonify({"msg": f"Serviço '{servico}' não é válido. Serviços válidos: {list(servicos_validos.keys())}"}), 400
    
    # Atualiza o campo correspondente
    campo = servicos_validos[servico]
    setattr(agendamento, campo, True)
    
    db.session.commit()
    
    return jsonify({
        "msg": f"Serviço '{servico}' registrado com sucesso",
        "agendamento_cirurgico": agendamento.to_dict()
    }), 200

@agendamentos_cirurgicos_bp.route('/<int:id>/marcar-realizada', methods=['POST'])
@jwt_required()
def marcar_cirurgia_realizada(id):
    """Endpoint para marcar uma cirurgia como realizada"""
    agendamento = AgendamentoCirurgico.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento cirúrgico não encontrado"}), 404
    
    agendamento.status_cirurgia = 'realizada'
    db.session.commit()
    
    return jsonify({
        "msg": "Cirurgia marcada como realizada com sucesso",
        "agendamento_cirurgico": agendamento.to_dict()
    }), 200

