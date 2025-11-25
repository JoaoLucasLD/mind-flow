import { DeleteConsultaUseCase } from './delete-consulta.use-case';
import { ConsultaRepository } from '../repositories/ConsultaRepository';
import { NotFoundException } from '@nestjs/common';
import { Consulta, ConsultaStatus } from '../entities/Consulta';

let deleteConsultaUseCase: DeleteConsultaUseCase;
let consultaRepository: jest.Mocked<ConsultaRepository>;

describe('Delete Consulta', () => {
  beforeEach(() => {
    consultaRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPacienteId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    deleteConsultaUseCase = new DeleteConsultaUseCase(consultaRepository);
  });

  it('Should be able to delete a consulta', async () => {
    const consultaId = 'consulta-123';
    const existingConsulta = new Consulta({
      id: consultaId,
      paciente_id: 'paciente-1',
      horario: new Date('2024-01-15T10:00:00Z'),
      tipo: 'Terapia Individual',
      categoria: 'Psicoterapia',
      tags: ['ansiedade'],
      status: ConsultaStatus.CONFIRMADO,
    });

    consultaRepository.findById.mockResolvedValue(existingConsulta);
    consultaRepository.delete.mockResolvedValue(undefined);

    await deleteConsultaUseCase.execute(consultaId);

    expect(consultaRepository.findById).toHaveBeenCalledWith(consultaId);
    expect(consultaRepository.delete).toHaveBeenCalledWith(consultaId);
  });

  it('Should not be able to delete a non-existent consulta', async () => {
    const consultaId = 'consulta-inexistente';

    consultaRepository.findById.mockResolvedValue(null);

    await expect(deleteConsultaUseCase.execute(consultaId)).rejects.toThrow(
      NotFoundException,
    );

    expect(consultaRepository.findById).toHaveBeenCalledWith(consultaId);
    expect(consultaRepository.delete).not.toHaveBeenCalled();
  });

  it('Should throw NotFoundException with correct message', async () => {
    const consultaId = 'consulta-inexistente';

    consultaRepository.findById.mockResolvedValue(null);

    await expect(deleteConsultaUseCase.execute(consultaId)).rejects.toThrow(
      'Consulta não encontrada.',
    );
  });
});

