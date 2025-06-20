# Modelo AgendamentoCirurgico (renomeado do Agendamento original)

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.paciente import db

class AgendamentoCirurgico(db.Model):
    __tablename__ = 'agendamentos_cirurgicos'
    
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    data_agendamento = db.Column(db.Date, nullable=False)
    procedimento_id = db.Column(db.Integer, db.ForeignKey('procedimentos.id'), nullable=False)
    grau_calvicie = db.Column(db.String(50), nullable=False)  # Obrigatório para cirurgias
    equipe_id = db.Column(db.Integer, db.ForeignKey('equipes.id'), nullable=False)
    local_atendimento_id = db.Column(db.Integer, db.ForeignKey('locais_atendimento.id'), nullable=False)
    horario_inicio = db.Column(db.Time, nullable=False)
    horario_fim = db.Column(db.Time, nullable=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias_procedimento.id'), nullable=False)
    valor_geral_venda = db.Column(db.Float, nullable=False)
    valor_pago = db.Column(db.Float, default=0.0)
    saldo_devedor = db.Column(db.Float, default=0.0)
    forma_pagamento = db.Column(db.String(100), nullable=True)
    contrato_assinado = db.Column(db.Boolean, default=False)
    exames = db.Column(db.Boolean, default=False)
    comunicacao_d7 = db.Column(db.Boolean, default=False)
    comunicacao_d2 = db.Column(db.Boolean, default=False)
    almoco_escolhido_id = db.Column(db.Integer, db.ForeignKey('refeicoes.id'), nullable=True)
    termo_marcacao = db.Column(db.Boolean, default=False)
    termo_alta = db.Column(db.Boolean, default=False)
    comunicacao_d1 = db.Column(db.Boolean, default=False)
    observacoes = db.Column(db.Text, nullable=True)
    acompanhante = db.Column(db.String(100), nullable=True)
    telefone_acompanhante = db.Column(db.String(20), nullable=True)
    status_cirurgia = db.Column(db.String(50), nullable=False, default='agendada')  # agendada, realizada, cancelada, remarcada
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    paciente = db.relationship('Paciente', backref='agendamentos_cirurgicos', lazy=True)
    procedimento = db.relationship('Procedimento', backref='agendamentos_cirurgicos', lazy=True)
    equipe = db.relationship('Equipe', backref='agendamentos_cirurgicos', lazy=True)
    local_atendimento = db.relationship('LocalAtendimento', backref='agendamentos_cirurgicos', lazy=True)
    categoria = db.relationship('CategoriaProcedimento', backref='agendamentos_cirurgicos', lazy=True)
    almoco_escolhido = db.relationship('Refeicao', backref='agendamentos_cirurgicos', lazy=True)
    
    def __repr__(self):
        return f'<AgendamentoCirurgico {self.id} - {self.data_agendamento}>'

    def validar(self):
        """Valida as regras de negócio do agendamento cirúrgico"""
        if not self.grau_calvicie:
            return False, "Grau de calvície é obrigatório para agendamentos cirúrgicos"
        
        if not self.equipe_id:
            return False, "Equipe é obrigatória para agendamentos cirúrgicos"
        
        if self.valor_geral_venda <= 0:
            return False, "Valor geral de venda deve ser maior que zero"
        
        if self.status_cirurgia not in ['agendada', 'realizada', 'cancelada', 'remarcada']:
            return False, "Status da cirurgia deve ser 'agendada', 'realizada', 'cancelada' ou 'remarcada'"
        
        return True, "Válido"

    def to_dict(self):
        return {
            'id': self.id,
            'paciente_id': self.paciente_id,
            'paciente_nome': self.paciente.nome if self.paciente else None,
            'data_agendamento': self.data_agendamento.isoformat() if self.data_agendamento else None,
            'procedimento_id': self.procedimento_id,
            'procedimento_nome': self.procedimento.nome if self.procedimento else None,
            'grau_calvicie': self.grau_calvicie,
            'equipe_id': self.equipe_id,
            'equipe_nome': self.equipe.nome if self.equipe else None,
            'local_atendimento_id': self.local_atendimento_id,
            'local_atendimento_nome': self.local_atendimento.nome if self.local_atendimento else None,
            'horario_inicio': self.horario_inicio.strftime('%H:%M') if self.horario_inicio else None,
            'horario_fim': self.horario_fim.strftime('%H:%M') if self.horario_fim else None,
            'categoria_id': self.categoria_id,
            'categoria_nome': self.categoria.nome if self.categoria else None,
            'valor_geral_venda': float(self.valor_geral_venda),
            'valor_pago': float(self.valor_pago),
            'saldo_devedor': float(self.saldo_devedor),
            'forma_pagamento': self.forma_pagamento,
            'contrato_assinado': self.contrato_assinado,
            'exames': self.exames,
            'comunicacao_d7': self.comunicacao_d7,
            'comunicacao_d2': self.comunicacao_d2,
            'almoco_escolhido_id': self.almoco_escolhido_id,
            'almoco_escolhido_nome': self.almoco_escolhido.nome if self.almoco_escolhido else None,
            'termo_marcacao': self.termo_marcacao,
            'termo_alta': self.termo_alta,
            'comunicacao_d1': self.comunicacao_d1,
            'observacoes': self.observacoes,
            'acompanhante': self.acompanhante,
            'telefone_acompanhante': self.telefone_acompanhante,
            'status_cirurgia': self.status_cirurgia,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

