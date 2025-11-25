import { UpdateConsultaUseCase } from './update-consulta.use-case';
import { ConsultaRepository } from '../repositories/ConsultaRepository';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Consulta, ConsultaStatus } from '../entities/Consulta';

let updateConsultaUseCase: UpdateConsultaUseCase;
let consultaRepository: jest.Mocked<ConsultaRepository>;
let prismaService: jest.Mocked<PrismaService>;

describe('Update Consulta', () => {
  beforeEach(() => {
    consultaRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPacienteId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    prismaService = {
      paciente: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as any;

    updateConsultaUseCase = new UpdateConsultaUseCase(
      consultaRepository,
      prismaService,
    );
  });

  it('Should be able to update a consulta', async () => {
    const consultaId = 'consulta-123';
    const existingConsulta = new Consulta({
      id: consultaId,
      paciente_id: 'paciente-1',
      horario: new Date('2024-01-15T10:00:00Z'),
      tipo: 'Terapia Individual',
      categoria: 'Psicoterapia',
      tags: ['ansiedade'],
      status: ConsultaStatus.A_CONFIRMAR,
    });

    const newHorario = new Date('2024-01-20T14:00:00Z');
    const newTipo = 'Terapia em Grupo';
    const newStatus = ConsultaStatus.CONFIRMADO;

    consultaRepository.findById.mockResolvedValue(existingConsulta);
    consultaRepository.update.mockResolvedValue(undefined);

    const updatedConsulta = await updateConsultaUseCase.execute({
      id: consultaId,
      horario: newHorario,
      tipo: newTipo,
      status: newStatus,
    });

    expect(updatedConsulta.horario).toEqual(newHorario);
    expect(updatedConsulta.tipo).toEqual(newTipo);
    expect(updatedConsulta.status).toEqual(newStatus);
    expect(consultaRepository.findById).toHaveBeenCalledWith(consultaId);
    expect(consultaRepository.update).toHaveBeenCalled();
  });

  it('Should not be able to update a non-existent consulta', async () => {
    const consultaId = 'consulta-inexistente';

    consultaRepository.findById.mockResolvedValue(null);

    await expect(
      updateConsultaUseCase.execute({
        id: consultaId,
        tipo: 'Novo Tipo',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(consultaRepository.findById).toHaveBeenCalledWith(consultaId);
    expect(consultaRepository.update).not.toHaveBeenCalled();
  });

  it('Should be able to update paciente_id and verify paciente exists', async () => {
    const consultaId = 'consulta-123';
    const existingConsulta = new Consulta({
      id: consultaId,
      paciente_id: 'paciente-1',
      horario: new Date('2024-01-15T10:00:00Z'),
      tipo: 'Terapia Individual',
      categoria: 'Psicoterapia',
      tags: ['ansiedade'],
      status: ConsultaStatus.A_CONFIRMAR,
    });

    const newPacienteId = 'paciente-2';

    consultaRepository.findById.mockResolvedValue(existingConsulta);
    (prismaService.paciente.findUnique as jest.Mock).mockResolvedValue({
      userId: newPacienteId,
      id: 'paciente-db-id',
    } as any);
    consultaRepository.update.mockResolvedValue(undefined);

    const updatedConsulta = await updateConsultaUseCase.execute({
      id: consultaId,
      paciente_id: newPacienteId,
    });

    expect(updatedConsulta.paciente_id).toEqual(newPacienteId);
    expect(prismaService.paciente.findUnique).toHaveBeenCalledWith({
      where: { userId: newPacienteId },
    });
    expect(consultaRepository.update).toHaveBeenCalled();
  });

  it('Should not be able to update paciente_id with non-existent paciente', async () => {
    const consultaId = 'consulta-123';
    const existingConsulta = new Consulta({
      id: consultaId,
      paciente_id: 'paciente-1',
      horario: new Date('2024-01-15T10:00:00Z'),
      tipo: 'Terapia Individual',
      categoria: 'Psicoterapia',
      tags: ['ansiedade'],
      status: ConsultaStatus.A_CONFIRMAR,
    });

    const nonExistentPacienteId = 'paciente-inexistente';

    consultaRepository.findById.mockResolvedValue(existingConsulta);
    (prismaService.paciente.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      updateConsultaUseCase.execute({
        id: consultaId,
        paciente_id: nonExistentPacienteId,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaService.paciente.findUnique).toHaveBeenCalledWith({
      where: { userId: nonExistentPacienteId },
    });
    expect(consultaRepository.update).not.toHaveBeenCalled();
  });

  it('Should be able to update only specific fields', async () => {
    const consultaId = 'consulta-123';
    const existingConsulta = new Consulta({
      id: consultaId,
      paciente_id: 'paciente-1',
      horario: new Date('2024-01-15T10:00:00Z'),
      tipo: 'Terapia Individual',
      categoria: 'Psicoterapia',
      tags: ['ansiedade'],
      status: ConsultaStatus.A_CONFIRMAR,
    });

    const newTags = ['ansiedade', 'depressão', 'estresse'];
    const newCategoria = 'Terapia Cognitivo-Comportamental';

    consultaRepository.findById.mockResolvedValue(existingConsulta);
    consultaRepository.update.mockResolvedValue(undefined);

    const updatedConsulta = await updateConsultaUseCase.execute({
      id: consultaId,
      tags: newTags,
      categoria: newCategoria,
    });

    expect(updatedConsulta.tags).toEqual(newTags);
    expect(updatedConsulta.categoria).toEqual(newCategoria);
    expect(updatedConsulta.tipo).toEqual(existingConsulta.tipo);
    expect(updatedConsulta.horario).toEqual(existingConsulta.horario);
  });

  it('Should be able to update sugestao_IA and transcricao_id', async () => {
    const consultaId = 'consulta-123';
    const existingConsulta = new Consulta({
      id: consultaId,
      paciente_id: 'paciente-1',
      horario: new Date('2024-01-15T10:00:00Z'),
      tipo: 'Terapia Individual',
      categoria: 'Psicoterapia',
      tags: ['ansiedade'],
      status: ConsultaStatus.A_CONFIRMAR,
    });

    const sugestao_IA = 'Nova sugestão de tratamento';
    const transcricao_id = 'transcricao-456';

    consultaRepository.findById.mockResolvedValue(existingConsulta);
    consultaRepository.update.mockResolvedValue(undefined);

    const updatedConsulta = await updateConsultaUseCase.execute({
      id: consultaId,
      sugestao_IA,
      transcricao_id,
    });

    expect(updatedConsulta.sugestao_IA).toEqual(sugestao_IA);
    expect(updatedConsulta.transcricao_id).toEqual(transcricao_id);
  });
});

