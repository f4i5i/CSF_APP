/**
 * Unit Tests for Classes Hooks
 * Tests useClass, useClasses, useAvailableClasses, useClassesByProgram,
 * useClassesByArea, usePrograms, useProgram, useAreas, useArea
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useClasses, useAvailableClasses, useClassesByProgram, useClassesByArea } from '../../../api/hooks/classes/useClasses';
import { useClass } from '../../../api/hooks/classes/useClass';
import { usePrograms, useProgram } from '../../../api/hooks/classes/usePrograms';
import { useAreas, useArea } from '../../../api/hooks/classes/useAreas';
import { mockSoccerClass, mockBasketballClass, mockClasses, mockPrograms } from '../../utils/mock-data';

jest.mock('../../../api/services/class.service', () => ({
  classService: {
    getAll: jest.fn(),
    getById: jest.fn(),
  },
}));

jest.mock('../../../api/services/program.service', () => ({
  programService: {
    getAll: jest.fn(),
    getById: jest.fn(),
  },
}));

jest.mock('../../../api/services/area.service', () => ({
  areaService: {
    getAll: jest.fn(),
    getById: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { classService } from '../../../api/services/class.service';
import { programService } from '../../../api/services/program.service';
import { areaService } from '../../../api/services/area.service';

const mockedClassService = classService as jest.Mocked<typeof classService>;
const mockedProgramService = programService as jest.Mocked<typeof programService>;
const mockedAreaService = areaService as jest.Mocked<typeof areaService>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false, refetchOnMount: false, refetchOnReconnect: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('Classes Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useClasses
  // =========================================================================
  describe('useClasses', () => {
    it('should fetch all classes', async () => {
      mockedClassService.getAll.mockResolvedValueOnce(mockClasses as any);

      const { result } = renderHook(() => useClasses(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockClasses);
      expect(mockedClassService.getAll).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to the service', async () => {
      const filters = { program_id: 'prog-1', is_active: true };
      mockedClassService.getAll.mockResolvedValueOnce([] as any);

      renderHook(() => useClasses({ filters: filters as any }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(mockedClassService.getAll).toHaveBeenCalledWith(filters));
    });

    it('should handle error state', async () => {
      mockedClassService.getAll.mockRejectedValueOnce(new Error('Server error'));

      const { result } = renderHook(() => useClasses(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // =========================================================================
  // useAvailableClasses
  // =========================================================================
  describe('useAvailableClasses', () => {
    it('should fetch available classes with active and has_capacity filters', async () => {
      mockedClassService.getAll.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => useAvailableClasses(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedClassService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: true, has_capacity: true })
      );
    });
  });

  // =========================================================================
  // useClassesByProgram
  // =========================================================================
  describe('useClassesByProgram', () => {
    it('should fetch classes filtered by programId', async () => {
      mockedClassService.getAll.mockResolvedValueOnce([mockSoccerClass] as any);

      const { result } = renderHook(
        () => useClassesByProgram({ programId: 'prog-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedClassService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ program_id: 'prog-1' })
      );
    });

    it('should not fetch when programId is empty', async () => {
      const { result } = renderHook(
        () => useClassesByProgram({ programId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useClassesByArea
  // =========================================================================
  describe('useClassesByArea', () => {
    it('should fetch classes filtered by areaId', async () => {
      mockedClassService.getAll.mockResolvedValueOnce([] as any);

      const { result } = renderHook(
        () => useClassesByArea({ areaId: 'area-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedClassService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ area_id: 'area-1' })
      );
    });

    it('should not fetch when areaId is empty', async () => {
      const { result } = renderHook(
        () => useClassesByArea({ areaId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useClass
  // =========================================================================
  describe('useClass', () => {
    it('should fetch a single class by ID', async () => {
      mockedClassService.getById.mockResolvedValueOnce(mockSoccerClass as any);

      const { result } = renderHook(
        () => useClass({ classId: 'class-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockSoccerClass);
      expect(mockedClassService.getById).toHaveBeenCalledWith('class-1');
    });

    it('should not fetch when classId is empty', async () => {
      const { result } = renderHook(
        () => useClass({ classId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedClassService.getById).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // usePrograms
  // =========================================================================
  describe('usePrograms', () => {
    it('should fetch all programs', async () => {
      mockedProgramService.getAll.mockResolvedValueOnce(mockPrograms as any);

      const { result } = renderHook(() => usePrograms(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPrograms);
    });

    it('should handle error state', async () => {
      mockedProgramService.getAll.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => usePrograms(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // =========================================================================
  // useProgram
  // =========================================================================
  describe('useProgram', () => {
    it('should fetch a single program by ID', async () => {
      const mockProgram = { id: 'prog-1', name: 'Soccer' };
      mockedProgramService.getById.mockResolvedValueOnce(mockProgram as any);

      const { result } = renderHook(
        () => useProgram({ programId: 'prog-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockProgram);
      expect(mockedProgramService.getById).toHaveBeenCalledWith('prog-1');
    });

    it('should not fetch when programId is empty', async () => {
      const { result } = renderHook(
        () => useProgram({ programId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useAreas
  // =========================================================================
  describe('useAreas', () => {
    it('should fetch all areas', async () => {
      const mockAreas = [{ id: 'area-1', name: 'North Campus' }];
      mockedAreaService.getAll.mockResolvedValueOnce(mockAreas as any);

      const { result } = renderHook(() => useAreas(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAreas);
    });
  });

  // =========================================================================
  // useArea
  // =========================================================================
  describe('useArea', () => {
    it('should fetch a single area by ID', async () => {
      const mockArea = { id: 'area-1', name: 'North Campus' };
      mockedAreaService.getById.mockResolvedValueOnce(mockArea as any);

      const { result } = renderHook(
        () => useArea({ areaId: 'area-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockArea);
      expect(mockedAreaService.getById).toHaveBeenCalledWith('area-1');
    });

    it('should not fetch when areaId is empty', async () => {
      const { result } = renderHook(
        () => useArea({ areaId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });
});
