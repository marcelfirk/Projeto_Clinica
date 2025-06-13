import os
import requests
from datetime import datetime

CLICKSIGN_ENDPOINT = 'https://sandbox.clicksign.com/api/v1'
CLICKSIGN_API_KEY = 'a0319798-5091-448f-8ba0-1e9fa05cf66e'
TEMPLATE_DOCUMENT_KEY = '0298c33f-b83d-4b57-8de9-8d943aa4bddf'

HEADERS = {"Content-Type": "application/json"}

def gerar_contrato_clicksign(dados):
    signer = criar_signatario(dados)
    documento = criar_documento(dados)
    lista = adicionar_signatario(documento['document']['key'], signer['signer']['key'])
    enviar_notificacao(lista['list']['request_signature_key'])

    return {
        "document_url": documento.get("document", {}).get("url"),
        "signer_key": signer.get("signer", {}).get("key"),
        "document_key": documento.get("document", {}).get("key")
    }

def criar_signatario(dados):
    url = f"{CLICKSIGN_ENDPOINT}/signers?access_token={CLICKSIGN_API_KEY}"
    payload = {
        "signer": {
            "email": dados['emailContratante'],
            "phone_number": ''.join(filter(str.isdigit, dados['telefoneContratante'])),
            "auths": ["email"],
            "name": dados['nomeContratante'],
            "documentation": dados['cpfContratante'],
            "birthday": formatar_data_iso(dados['dtNascimentoContratante']),
            "has_documentation": True
        }
    }
    response = requests.post(url, json=payload, headers=HEADERS)
    if response.status_code != 201:
        raise Exception(f"Erro ao criar signatário: {response.text}")
    return response.json()

def criar_documento(dados):
    url = f"{CLICKSIGN_ENDPOINT}/templates/{TEMPLATE_DOCUMENT_KEY}/documents?access_token={CLICKSIGN_API_KEY}"
    path = f"/Contratos/{dados['nomeContratante'].replace(' ', '_')}_{int(datetime.now().timestamp())}.pdf"

    template_data = {
        "nomeContratante": dados['nomeContratante'],
        "nacionalidadeContratante": dados['nacionalidadeContratante'],
        "dtNascimentoContratante": formatar_data_br(dados['dtNascimentoContratante']),
        "cpfContratante": dados['cpfContratante'],
        "enderecoContratante": dados['enderecoContratante'],
        "telefoneContratante": dados['telefoneContratante'],
        "emailContratante": dados['emailContratante'],
        "nomeMedico": dados['nomeMedico'],
        "crmMedico": dados['crmMedico'],
        "valorTotalNumerico": dados['valorTotalNumerico'],
        "valorTotalExtenso": dados['valorTotalExtenso'],
        "valorSinalNumerico": dados['valorSinalNumerico'],
        "valorSinalExtenso": dados['valorSinalExtenso'],
        "valorRestanteNumerico": dados['valorRestanteNumerico'],
        "valorRestanteExtenso": dados['valorRestanteExtenso'],
        "dataContrato": formatar_data_br(dados['dataContrato']),
        "nomeContratanteUpper": dados['nomeContratanteUpper'],
        "nomeMedicoUpper": dados['nomeMedicoUpper'],
        "cpfMedico": dados['cpfMedico'],
        "dtProcedimento": formatar_data_br(dados['dtProcedimento'])
    }

    payload = {
        "document": {
            "path": path,
            "template": {"data": template_data}
        }
    }

    response = requests.post(url, json=payload, headers=HEADERS)
    if response.status_code != 201:
        raise Exception(f"Erro ao criar documento: {response.text}")
    return response.json()

def adicionar_signatario(document_key, signer_key):
    url = f"{CLICKSIGN_ENDPOINT}/lists?access_token={CLICKSIGN_API_KEY}"
    payload = {
        "list": {
            "document_key": document_key,
            "signer_key": signer_key,
            "sign_as": "contractor",
            "message": "Por favor, assine o contrato de procedimento capilar"
        }
    }
    response = requests.post(url, json=payload, headers=HEADERS)
    if response.status_code != 201:
        raise Exception(f"Erro ao associar signatário: {response.text}")
    return response.json()

def enviar_notificacao(request_signature_key):
    url = f"{CLICKSIGN_ENDPOINT}/notifications?access_token={CLICKSIGN_API_KEY}"
    payload = {
        "request_signature_key": request_signature_key,
        "message": "Você recebeu um contrato para assinatura - Clínica de Transplante Capilar"
    }
    response = requests.post(url, json=payload, headers=HEADERS)
    if response.status_code != 202:
        raise Exception(f"Erro ao enviar notificação: {response.text}")

def formatar_data_iso(data_str):
    try:
        if data_str and data_str.count("-") == 2:
            datetime.strptime(data_str, "%Y-%m-%d")  # valida
            return data_str
    except Exception:
        pass
    return ""

def formatar_data_br(data_str):
    try:
        if data_str and data_str.count("-") == 2:
            dt = datetime.strptime(data_str, "%Y-%m-%d")
            return dt.strftime("%d/%m/%Y")
    except Exception:
        pass
    return data_str
