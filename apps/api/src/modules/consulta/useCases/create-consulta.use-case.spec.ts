import { CreateConsultaUseCase } from './create-consulta.use-case';
import { ConsultaRepository } from '../repositories/ConsultaRepository';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Consulta, ConsultaStatus } from '../entities/Consulta';

let createConsultaUseCase: CreateConsultaUseCase;
let consultaRepository: jest.Mocked<ConsultaRepository>;
let prismaService: jest.Mocked<PrismaService>;

describe('Create Consulta', () => {
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

    createConsultaUseCase = new CreateConsultaUseCase(
      consultaRepository,
      prismaService,
    );
  });

  it('Should be able to create a consulta', async () => {
    const pacienteId = 'paciente-123';
    const horario = new Date('2024-01-15T10:00:00Z');
    const tipo = 'Terapia Individual';
    const categoria = 'Psicoterapia';
    const tags = ['ansiedade', 'depressão'];

    (prismaService.paciente.findUnique as jest.Mock).mockResolvedValue({
      userId: pacienteId,
      id: 'paciente-db-id',
    } as any);

    consultaRepository.create.mockResolvedValue(undefined);

    const consulta = await createConsultaUseCase.execute({
      paciente_id: pacienteId,
      horario,
      tipo,
      categoria,
      tags,
    });

    expect(consulta).toBeInstanceOf(Consulta);
    expect(consulta.paciente_id).toEqual(pacienteId);
    expect(consulta.horario).toEqual(horario);
    expect(consulta.tipo).toEqual(tipo);
    expect(consulta.categoria).toEqual(categoria);
    expect(consulta.tags).toEqual(tags);
    expect(consulta.status).toEqual(ConsultaStatus.A_CONFIRMAR);
    expect(consultaRepository.create).toHaveBeenCalledWith(expect.any(Consulta));
    expect(prismaService.paciente.findUnique).toHaveBeenCalledWith({
      where: { userId: pacienteId },
    });
  });

  it('Should be able to create a consulta with status', async () => {
    const pacienteId = 'paciente-123';
    const horario = new Date('2024-01-15T10:00:00Z');
    const tipo = 'Terapia Individual';
    const categoria = 'Psicoterapia';
    const tags = ['ansiedade'];
    const status = ConsultaStatus.CONFIRMADO;

    (prismaService.paciente.findUnique as jest.Mock).mockResolvedValue({
      userId: pacienteId,
      id: 'paciente-db-id',
    } as any);

    consultaRepository.create.mockResolvedValue(undefined);

    const consulta = await createConsultaUseCase.execute({
      paciente_id: pacienteId,
      horario,
      tipo,
      categoria,
      tags,
      status,
    });

    expect(consulta.status).toEqual(ConsultaStatus.CONFIRMADO);
  });

  it('Should be able to create a consulta with sugestao_IA and transcricao_id', async () => {
    const pacienteId = 'paciente-123';
    const horario = new Date('2024-01-15T10:00:00Z');
    const tipo = 'Terapia Individual';
    const categoria = 'Psicoterapia';
    const tags = ['ansiedade'];
    const sugestao_IA = 'Sugestão de tratamento';
    const transcricao_id = 'transcricao-123';

    (prismaService.paciente.findUnique as jest.Mock).mockResolvedValue({
      userId: pacienteId,
      id: 'paciente-db-id',
    } as any);

    consultaRepository.create.mockResolvedValue(undefined);

    const consulta = await createConsultaUseCase.execute({
      paciente_id: pacienteId,
      horario,
      tipo,
      categoria,
      tags,
      sugestao_IA,
      transcricao_id,
    });

    expect(consulta.sugestao_IA).toEqual(sugestao_IA);
    expect(consulta.transcricao_id).toEqual(transcricao_id);
  });

  it('Should not be able to create a consulta with non-existent paciente', async () => {
    const pacienteId = 'paciente-inexistente';

    (prismaService.paciente.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      createConsultaUseCase.execute({
        paciente_id: pacienteId,
        horario: new Date(),
        tipo: 'Terapia Individual',
        categoria: 'Psicoterapia',
        tags: [],
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaService.paciente.findUnique).toHaveBeenCalledWith({
      where: { userId: pacienteId },
    });
    expect(consultaRepository.create).not.toHaveBeenCalled();
  });
});

