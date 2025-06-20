import os
import requests
from datetime import datetime, timedelta
import uuid
from src.models.lancamento_financeiro import LancamentoFinanceiro
from src.models.paciente import Paciente
from src.models.boleto import Boleto
from src.models.paciente import db
import re


class CoraService:
    def __init__(self):
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        self.cert_file = os.path.join(BASE_DIR, '..', 'static', 'certificate.pem')
        self.key_file = os.path.join(BASE_DIR, '..', 'static', 'private-key.key')

        self.token_url = 'https://matls-clients.api.stage.cora.com.br/token/'
        self.invoice_url = 'https://matls-clients.api.stage.cora.com.br/v2/invoices'
        self.client_id = 'int-3818O5Mq04gfVgBm16ck0D'

        self.access_token = None
        self.token_expiration = None

    def _get_access_token(self):
        """Gera um novo token se não existir ou se estiver expirado"""
        if self.access_token and self.token_expiration and datetime.utcnow() < self.token_expiration:
            return self.access_token

        data = {
            'grant_type': 'client_credentials',
            'client_id': self.client_id
        }
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        response = requests.post(
            self.token_url,
            data=data,
            headers=headers,
            cert=(self.cert_file, self.key_file)
        )

        if response.status_code != 200:
            raise Exception(f"Erro ao obter token da Cora: {response.text}")

        resp_json = response.json()
        self.access_token = resp_json['access_token']
        expires_in = resp_json.get('expires_in', 3600)  # padrão 1h
        self.token_expiration = datetime.utcnow() + timedelta(seconds=expires_in - 60)

        return self.access_token

    def gerar_boleto(self, lancamento_id: int, servico: str, descricao_servico: str) -> dict:
        """Gera boleto na Cora a partir de um lançamento financeiro"""

        lancamento = LancamentoFinanceiro.query.get(lancamento_id)
        if not lancamento:
            raise Exception("Lançamento não encontrado.")

        if lancamento.tipo != 'a_receber':
            raise Exception("Somente lançamentos 'a_receber' podem gerar boletos.")
        
        paciente = None

        if lancamento.contrato and lancamento.contrato.paciente:
            paciente = lancamento.contrato.paciente

        elif lancamento.pacote_tratamento and lancamento.pacote_tratamento.paciente:
            paciente = lancamento.pacote_tratamento.paciente

        if not paciente:
            raise Exception("Lançamento não possui paciente associado via contrato ou pacote de tratamento.")

        idempotency_key = str(uuid.uuid4())

        token = self._get_access_token()

        headers = {
            'Authorization': f'Bearer {token}',
            'Idempotency-Key': idempotency_key,
            'Content-Type': 'application/json'
        }

        payload = {
            "code": f"LANC-{lancamento.id}",
            "customer": {
                "name": paciente.nome,
                "email": paciente.email,
                "document": {
                    "identity": re.sub(r'\D', '', paciente.cpf),
                    "type": "CPF"
                },
                "address": {
                    "street": paciente.logradouro or "N/A",
                    "number": paciente.numero or "N/A",
                    "district": paciente.bairro or "N/A",
                    "city": paciente.cidade or "N/A",
                    "state": paciente.estado or "SP",
                    "complement": paciente.complemento or "N/A",
                    "zip_code": re.sub(r'\D', '', paciente.cep) or "00000000"
                }
            },
            "services": [{
                "name": servico,
                "description": descricao_servico,
                "amount": int(float(lancamento.valor) * 100)  # Cora exige em centavos
            }],
            "payment_terms": {
                "due_date": lancamento.data_vencimento.strftime('%Y-%m-%d'),
            },
            "notifications": {
                "channels": ["EMAIL"],
                "destination": {
                    "name": paciente.nome,
                    "email": paciente.email
                },
            "rules": [
                "NOTIFY_TWO_DAYS_BEFORE_DUE_DATE"
            ]
            }
        }

        response = requests.post(
            self.invoice_url,
            headers=headers,
            json=payload,
            cert=(self.cert_file, self.key_file)
        )

        if response.status_code != 200 and response.status_code != 201:
            raise Exception(f"Erro ao gerar boleto: {response.status_code} - {response.text}")

        resp = response.json()

        bank_slip = resp.get('payment_options', {}).get('bank_slip', {})

        boleto = Boleto(
            lancamento_id=lancamento.id,
            servico=servico,
            descricao_servico=descricao_servico,
            codigo_barras=bank_slip.get('barcode'),
            linha_digitavel=bank_slip.get('digitable'),
            invoice_id=resp.get('id'),
            link_pdf=bank_slip.get('url')
        )

        db.session.add(boleto)
        db.session.commit()

        return boleto.to_dict()

