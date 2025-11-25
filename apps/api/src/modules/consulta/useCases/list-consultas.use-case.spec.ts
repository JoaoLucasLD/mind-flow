import { ListConsultasUseCase } from './list-consultas.use-case';
import { ConsultaRepository } from '../repositories/ConsultaRepository';
import { Consulta, ConsultaStatus } from '../entities/Consulta';

let listConsultasUseCase: ListConsultasUseCase;
let consultaRepository: jest.Mocked<ConsultaRepository>;

describe('List Consultas', () => {
  beforeEach(() => {
    consultaRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPacienteId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    listConsultasUseCase = new ListConsultasUseCase(consultaRepository);
  });

  it('Should be able to list all consultas', async () => {
    const consultas = [
      new Consulta({
        id: 'consulta-1',
        paciente_id: 'paciente-1',
        horario: new Date('2024-01-15T10:00:00Z'),
        tipo: 'Terapia Individual',
        categoria: 'Psicoterapia',
        tags: ['ansiedade'],
        status: ConsultaStatus.CONFIRMADO,
      }),
      new Consulta({
        id: 'consulta-2',
        paciente_id: 'paciente-2',
        horario: new Date('2024-01-16T14:00:00Z'),
        tipo: 'Terapia em Grupo',
        categoria: 'Psicoterapia',
        tags: ['depressão'],
        status: ConsultaStatus.A_CONFIRMAR,
      }),
    ];

    consultaRepository.findAll.mockResolvedValue(consultas);

    const result = await listConsultasUseCase.execute();

    expect(result).toEqual(consultas);
    expect(consultaRepository.findAll).toHaveBeenCalled();
  });

  it('Should return empty array when no consultas exist', async () => {
    consultaRepository.findAll.mockResolvedValue([]);

    const result = await listConsultasUseCase.execute();

    expect(result).toEqual([]);
    expect(consultaRepository.findAll).toHaveBeenCalled();
  });

  it('Should be able to execute with psicologoId parameter', async () => {
    const psicologoId = 'psicologo-123';
    const consultas = [
      new Consulta({
        id: 'consulta-1',
        paciente_id: 'paciente-1',
        horario: new Date('2024-01-15T10:00:00Z'),
        tipo: 'Terapia Individual',
        categoria: 'Psicoterapia',
        tags: ['ansiedade'],
        status: ConsultaStatus.CONFIRMADO,
      }),
    ];

    consultaRepository.findAll.mockResolvedValue(consultas);

    const result = await listConsultasUseCase.execute(psicologoId);

    expect(result).toEqual(consultas);
    expect(consultaRepository.findAll).toHaveBeenCalled();
  });
});

