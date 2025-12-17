import { useState, useEffect } from 'react';
import { baseUrl } from '../../assets';



const useRepairHistory = (repairId, open) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    if (!repairId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/api/repairs/getHistory/${repairId}`);

      if (!response.ok) {

        if(response.status === 404){
          throw new Error('לא קיים היסטוריה על חט"כ זה');
        }
        throw new Error('שגיאה בטעינת ההיסטוריה');
      }

      const data = await response.json();
      setHistoryData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'שגיאה בטעינת ההיסטוריה');
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (open && repairId) {
      fetchHistory();
    }
  }, [open, repairId]);

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  return { historyData, loading, error, refetch: fetchHistory };
};

export default useRepairHistory;
