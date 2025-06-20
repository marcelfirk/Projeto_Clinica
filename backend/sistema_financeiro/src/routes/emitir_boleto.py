from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.services.cora_service import CoraService
from src.models.boleto import Boleto
from src.models.lancamento_financeiro import LancamentoFinanceiro
from src.models.paciente import db
import traceback

boletos_bp = Blueprint('boletos', __name__)
cora_service = CoraService()


@boletos_bp.route('/emitir', methods=['POST'])
@jwt_required()
def emitir_boleto():
    print(request.json)
    """
    Endpoint para emissão de boleto na Cora.

    Espera um JSON no seguinte formato:
    {
        "lancamento_id": 1,
        "servico": "Microagulhamento",
        "descricao_servico": "Sessão de microagulhamento facial"
    }
    """
    data = request.get_json()

    lancamento_id = data.get('lancamento_id')
    servico = data.get('servico')
    descricao_servico = data.get('descricao_servico')

    # Validações
    if not lancamento_id:
        return jsonify({"msg": "O campo 'lancamento_id' é obrigatório."}), 400
    if not servico:
        return jsonify({"msg": "O campo 'servico' é obrigatório."}), 400
    if not descricao_servico:
        return jsonify({"msg": "O campo 'descricao_servico' é obrigatório."}), 400

    lancamento = LancamentoFinanceiro.query.get(lancamento_id)
    if not lancamento:
        return jsonify({"msg": "Lançamento financeiro não encontrado."}), 404

    boleto_existente = Boleto.query.filter_by(lancamento_id=lancamento_id).first()
    if boleto_existente:
        return jsonify({
            "msg": "Já existe um boleto gerado para este lançamento.",
            "boleto": {
                "id": boleto_existente.id,
                "linha_digitavel": boleto_existente.linha_digitavel,
                "codigo_barras": boleto_existente.codigo_barras,
                "link_pdf": boleto_existente.link_pdf
            }
        }), 200

    try:
        boleto = cora_service.gerar_boleto(
            lancamento_id=lancamento_id,
            servico=servico,
            descricao_servico=descricao_servico
        )

        return jsonify({
            "msg": "Boleto gerado com sucesso.",
            "boleto": boleto
        }), 201

    except Exception as e:
        traceback.print_exc()  # Isso imprime o stack trace completo no console
        return jsonify({
            "msg": f"Erro ao gerar boleto: {str(e)}"
        }), 500
    
@boletos_bp.route('/', methods=['GET'])
@jwt_required()
def listar_boletos():
    """Lista todos os boletos emitidos"""
    boletos = Boleto.query.all()

    resultado = []
    for boleto in boletos:
        resultado.append({
            "id": boleto.id,
            "lancamento_id": boleto.lancamento_id,
            "servico": boleto.servico,
            "descricao_servico": boleto.descricao_servico,
            "codigo_barras": boleto.codigo_barras,
            "linha_digitavel": boleto.linha_digitavel,
            "invoice_id": boleto.invoice_id,
            "link_pdf": boleto.link_pdf
        })

    return jsonify(resultado), 200

