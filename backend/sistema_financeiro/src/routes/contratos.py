from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.contrato import Contrato, db
from src.models.paciente import Paciente
from src.models.agendamento import Agendamento
from src.services.clicksign_service import gerar_contrato_clicksign
from num2words import num2words
from datetime import datetime, date

contratos_bp = Blueprint('contratos', __name__)

@contratos_bp.route('/', methods=['GET'])
@jwt_required()
def listar_contratos():
    """Endpoint para listar todos os contratos"""
    contratos = Contrato.query.all()
    
    resultado = []
    for contrato in contratos:
        resultado.append({
            "id": contrato.id,
            "identificador_contrato": contrato.identificador_contrato,
            "paciente_id": contrato.paciente_id,
            "valor_sinal": contrato.valor_sinal,
            "valor_restante": contrato.valor_restante,
            "status": contrato.status,
            "data_criacao": contrato.data_criacao.isoformat(),
            "data_atualizacao": contrato.data_atualizacao.isoformat(),
            "paciente": contrato.paciente.nome,
            "procedimento_nome": contrato.agendamento.procedimento.nome
        })

    return jsonify(resultado), 200

@contratos_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_contrato(id):
    """Endpoint para obter um contrato específico"""
    contrato = Contrato.query.get(id)
    contrato = Contrato.query.options(db.joinedload(Contrato.paciente)).get(id)
    
    if not contrato:
        return jsonify({"msg": "Contrato não encontrado"}), 404
    
    return jsonify({
        "id": contrato.id,
            "identificador_contrato": contrato.identificador_contrato,
            "paciente_id": contrato.paciente_id,
            "valor_sinal": contrato.valor_sinal,
            "valor_restante": contrato.valor_restante,
            "status": contrato.status,
            "data_criacao": contrato.data_criacao.isoformat(),
            "data_atualizacao": contrato.data_atualizacao.isoformat(),
            "paciente": contrato.paciente.nome
    }), 200

@contratos_bp.route('/', methods=['POST'])
@jwt_required()
def criar_contrato():
    """Endpoint para criar um novo contrato"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    print(request.json.get('valor_restante'))
    # Campos obrigatórios
    paciente_id = request.json.get('paciente_id', None)
    agendamento_id = request.json.get('agendamento_id', None)
    valor_sinal = request.json.get('valor_sinal', None)
    valor_restante = request.json.get('valor_restante', None)
    
    if paciente_id is None or agendamento_id is None or valor_sinal is None or valor_restante is None:
        return jsonify({"msg": "Paciente, agendamento, valor do sinal e valor restante são obrigatórios"}), 400
    
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    try:
        # Converte valor para float
        valor_sinal = float(valor_sinal)
    except ValueError:
        return jsonify({"msg": "Valor sinal deve ser um número"}), 400
    
    if valor_restante is None or str(valor_restante).strip() == "":
        return jsonify({"msg": "Valor restante é obrigatório"}), 400

    try:
        valor_restante = float(valor_restante)
    except ValueError:
        return jsonify({"msg": "Valor restante deve ser um número"}), 400
    
    # Gera identificador único
    identificador_contrato = Contrato.gerar_identificador()
    
    # Cria novo contrato
    novo_contrato = Contrato(
        identificador_contrato=identificador_contrato,
        paciente_id=paciente_id,
        agendamento_id=agendamento_id,
        valor_sinal=valor_sinal,
        valor_restante=valor_restante,
        status=request.json.get('status', 'ativo')
    )
    
    db.session.add(novo_contrato)
    db.session.commit()
    
    return jsonify({
        "msg": "Contrato criado com sucesso",
        "contrato": {
            "id": novo_contrato.id,
            "identificador_contrato": novo_contrato.identificador_contrato,
            "paciente_id": novo_contrato.paciente_id,
            "agendamento_id": novo_contrato.agendamento_id,
            "valor_sinal": float(novo_contrato.valor_sinal),
            "valor_restante": float(novo_contrato.valor_restante),
            "status": novo_contrato.status,
            "data_criacao": novo_contrato.data_criacao.isoformat(),
            "data_atualizacao": novo_contrato.data_atualizacao.isoformat()
        }
    }), 201

@contratos_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_contrato(id):
    """Endpoint para atualizar um contrato existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    contrato = Contrato.query.get(id)
    
    if not contrato:
        return jsonify({"msg": "Contrato não encontrado"}), 404
    
    # Atualiza campos
    if 'paciente_id' in request.json:
        paciente = Paciente.query.get(request.json['paciente_id'])
        if not paciente:
            return jsonify({"msg": "Paciente não encontrado"}), 404
        contrato.paciente_id = request.json['paciente_id']
    
    if 'agendamento_id' in request.json:
        contrato.agendamento_id = request.json['agendamento_id']
    
    if 'valor_sinal' in request.json:
        try:
            contrato.valor_sinal = float(request.json['valor_sinal'])
        except ValueError:
            return jsonify({"msg": "Valor sinal deve ser um número"}), 400
        
    if 'valor_restante' in request.json:
        try:
            contrato.valor_restante = float(request.json['valor_restante'])
        except ValueError:
            return jsonify({"msg": "Valor restante deve ser um número"}), 400
    
    if 'status' in request.json:
        contrato.status = request.json['status']
    
    db.session.commit()
    
    return jsonify({
        "msg": "Contrato atualizado com sucesso",
        "contrato": {
            "id": contrato.id,
            "identificador_contrato": contrato.identificador_contrato,
            "paciente_id": contrato.paciente_id,
            "valor_sinal": contrato.valor_sinal,
            "valor_restante": contrato.valor_restante,
            "status": contrato.status,
            "data_criacao": contrato.data_criacao.isoformat(),
            "data_atualizacao": contrato.data_atualizacao.isoformat()
        }
    }), 200

@contratos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def excluir_contrato(id):
    """Endpoint para excluir um contrato"""
    contrato = Contrato.query.get(id)
    
    if not contrato:
        return jsonify({"msg": "Contrato não encontrado"}), 404
    
    # Verifica se contrato possui lançamentos
    if contrato.lancamentos:
        return jsonify({"msg": "Não é possível excluir contrato com lançamentos associados"}), 400
    
    db.session.delete(contrato)
    db.session.commit()
    
    return jsonify({"msg": "Contrato excluído com sucesso"}), 200

@contratos_bp.route('/paciente/<int:paciente_id>', methods=['GET'])
@jwt_required()
def listar_contratos_por_paciente(paciente_id):
    """Endpoint para listar contratos de um paciente específico"""
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    contratos = Contrato.query.filter_by(paciente_id=paciente_id).all()
    
    resultado = []
    for contrato in contratos:
        resultado.append({
            "id": contrato.id,
            "identificador_contrato": contrato.identificador_contrato,
            "paciente_id": contrato.paciente_id,
            "valor_sinal": contrato.valor_sinal,
            "valor_restante": contrato.valor_restante,
            "status": contrato.status,
            "data_criacao": contrato.data_criacao.isoformat(),
            "data_atualizacao": contrato.data_atualizacao.isoformat()
        })
    
    return jsonify(resultado), 200


@contratos_bp.route('/<int:contrato_id>/gerar-clicksign', methods=['POST'])
@jwt_required()
def gerar_contrato_clicksign_handler(contrato_id):
    contrato = Contrato.query.get_or_404(contrato_id)
    paciente = Paciente.query.get_or_404(contrato.paciente_id)
    agendamento = Agendamento.query.get_or_404(contrato.agendamento_id)
    dados = {
        "nomeContratante": paciente.nome,
        "nacionalidadeContratante": paciente.nacionalidade,
        "dtNascimentoContratante": paciente.data_nascimento.strftime("%Y-%m-%d"),
        "cpfContratante": paciente.cpf,
        "enderecoContratante": paciente.endereco,
        "telefoneContratante": paciente.telefone,
        "emailContratante": paciente.email,
        "nomeMedico": "Dr. Júlio de Oliveira Portes",
        "crmMedico": "CRM/SC 33460",
        "cpfMedico": "016.208.576-18",
        "dtProcedimento": agendamento.data_agendamento.strftime("%Y-%m-%d"),
        "valorTotalNumerico": contrato.agendamento.valor_geral_venda,
        "valorTotalExtenso": num2words(contrato.agendamento.valor_geral_venda, lang='pt_BR'),
        "valorSinalNumerico": contrato.valor_sinal,
        "valorSinalExtenso": num2words(contrato.valor_sinal, lang='pt_BR'),
        "valorRestanteNumerico": contrato.valor_restante,
        "valorRestanteExtenso": num2words(contrato.valor_restante, lang='pt_BR'),
        "dataContrato": date.today().strftime("%Y-%m-%d"),
        "nomeContratanteUpper": paciente.nome.upper(),
        "nomeMedicoUpper": "Dr. JÚLIO DE OLIVEIRA PORTES"
    }

    try:
        resultado = gerar_contrato_clicksign(dados)
        print("Resultado Clicksign:", resultado)
        return jsonify({"msg": "Contrato enviado com sucesso", "data": resultado}), 200
    except Exception as e:
        print("Erro ao gerar contrato:", str(e))
        return jsonify({"msg": f"Erro ao gerar contrato: {str(e)}"}), 500