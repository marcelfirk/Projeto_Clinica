import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import {
  EventContentArg,
  EventDropArg,
  DatesSetArg,
  EventClickArg
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, {
  DateClickArg
} from '@fullcalendar/interaction';
import { EventApi, EventInput } from '@fullcalendar/core';
import ptBr from '@fullcalendar/core/locales/pt-br';
import { Modal, Box, Typography, Button } from '@mui/material';
import { agendamentoService } from '../services/api';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const AgendamentoCalendar: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString();
    fetchEvents(start, end);
  }, []);

  const fetchEvents = async (startStr: string, endStr: string) => {
  try {
    const start = startStr.split('T')[0]; // pega só a data
    const end = endStr.split('T')[0];
    const data = await agendamentoService.getByPeriodo(start, end);
    setEvents(data);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
  }
  };

  const handleDateClick = (arg: DateClickArg) => {
    window.location.href = `/agendamentos/novo?data=${arg.dateStr}`;
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    fetchEvents(arg.startStr, arg.endStr);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Calendário de Agendamentos</h1>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBr}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          height="auto"
          eventDidMount={eventDidMount}
          editable={true}
          eventDrop={handleEventDrop}
        />
      </div>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          {selectedEvent && (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
                Detalhes do Agendamento
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Paciente:</strong> {selectedEvent.extendedProps.paciente}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Procedimento:</strong> {selectedEvent.extendedProps.procedimento}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Data/Hora:</strong> {new Date(selectedEvent.start!).toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Equipe:</strong> {selectedEvent.extendedProps.equipe}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Local:</strong> {selectedEvent.extendedProps.local}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Valor:</strong> R$ {Number(selectedEvent.extendedProps.valor).toFixed(2).replace('.', ',')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status Pagamento:</strong> {selectedEvent.extendedProps.status_pagamento}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  href={`/agendamentos/${selectedEvent.id}/editar`}
                  sx={{ mr: 2 }}
                >
                  Editar
                </Button>
                <Button variant="outlined" onClick={handleCloseModal}>Fechar</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

// Renderização de conteúdo do evento
function renderEventContent(eventInfo: EventContentArg) {
  const { paciente, procedimento } = eventInfo.event.extendedProps;

  return (
    <div
      style={{
        padding: '6px 8px',
        borderRadius: '6px',
        backgroundColor: '#FFA500',
        color: '#fff',
        fontSize: '0.85em',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 600 }}>{paciente}</div>
      <div style={{ opacity: 0.85 }}>{eventInfo.timeText} - {procedimento}</div>
    </div>
  );
}

// Estilização do evento de acordo com o status
function eventDidMount(info: { event: EventApi; el: HTMLElement }) {
  const status = info.event.extendedProps.status_pagamento;

  info.el.style.border = 'none';
  info.el.style.padding = '0';
  info.el.style.margin = '2px 0';

  const colorMap: any = {
    Pago: '#4caf50',
    Parcial: '#ff9800',
    Pendente: '#f44336',
  };

  info.el.style.backgroundColor = colorMap[status] || '#2196f3';
  info.el.style.borderRadius = '6px';
  info.el.style.color = 'white';
  info.el.style.fontSize = '0.8em';
}

// Lógica de arrastar e soltar
async function handleEventDrop(dropInfo: EventDropArg) {
  try {
    const response = await fetch(`/agendamentos/${dropInfo.event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data_agendamento: dropInfo.event.start?.toISOString().split('T')[0],
        horario_inicio: dropInfo.event.start?.toTimeString().split(' ')[0],
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || 'Erro ao atualizar agendamento');
    }
  } catch (error) {
    console.error('Erro:', error);
    dropInfo.revert();
  }
}

export default AgendamentoCalendar;
