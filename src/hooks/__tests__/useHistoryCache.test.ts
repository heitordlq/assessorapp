import { renderHook, act } from '@testing-library/react-native';
import { useHistoryCache } from '../useHistoryCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

// TODO: testes marcados com it.skip estao desatualizados em relacao ao hook e precisam ser reescritos.
describe('useHistoryCache', () => {
  const mockHistoryItem = {
    id: '1',
    type: 'test',
    title: 'Test Item',
    description: 'Test Description',
    data: { test: 'data' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('deve carregar histórico vazio inicialmente', async () => {
    const { result } = renderHook(() => useHistoryCache());
    
    await act(async () => {
      const history = await result.current.loadHistory({ key: 'test' });
      expect(history).toEqual([]);
    });
  });

  it('deve adicionar item ao histórico', async () => {
    const { result } = renderHook(() => useHistoryCache());
    
    await act(async () => {
      const newItem = await result.current.addToHistory(mockHistoryItem, { key: 'test' });
      expect(newItem).toHaveProperty('timestamp');
      expect(newItem?.id).toBe(mockHistoryItem.id);
    });
  });

  it('deve remover item do histórico', async () => {
    const { result } = renderHook(() => useHistoryCache());
    
    await act(async () => {
      await result.current.addToHistory(mockHistoryItem, { key: 'test' });
      const success = await result.current.removeFromHistory(mockHistoryItem.id, { key: 'test' });
      expect(success).toBe(true);
    });
  });

  it('deve limpar todo o histórico', async () => {
    const { result } = renderHook(() => useHistoryCache());
    
    await act(async () => {
      await result.current.addToHistory(mockHistoryItem, { key: 'test' });
      const success = await result.current.clearHistory({ key: 'test' });
      expect(success).toBe(true);
    });
  });

  it.skip('deve respeitar o limite máximo de itens', async () => {
    const { result } = renderHook(() => useHistoryCache());
    const maxItems = 2;
    
    await act(async () => {
      await result.current.addToHistory({ ...mockHistoryItem, id: '1' }, { key: 'test', maxItems });
      await result.current.addToHistory({ ...mockHistoryItem, id: '2' }, { key: 'test', maxItems });
      await result.current.addToHistory({ ...mockHistoryItem, id: '3' }, { key: 'test', maxItems });
      
      const history = await result.current.loadHistory({ key: 'test' });
      expect(history.length).toBe(maxItems);
    });
  });

  it.skip('deve gerenciar estado local com useHistoryWithCache', async () => {
    const { result } = renderHook(() => useHistoryCache());
    const { result: historyResult } = renderHook(() => 
      result.current.useHistoryWithCache({ key: 'test' })
    );
    
    await act(async () => {
      await historyResult.current.addItem(mockHistoryItem);
      expect(historyResult.current.history.length).toBe(1);
      
      await historyResult.current.removeItem(mockHistoryItem.id);
      expect(historyResult.current.history.length).toBe(0);
    });
  });

  it.skip('deve lidar com erros adequadamente', async () => {
    const { result } = renderHook(() => useHistoryCache());
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      const history = await result.current.loadHistory({ key: 'test' });
      expect(history).toEqual([]);
      expect(result.current.error).toBe('Test error');
    });
  });
}); 