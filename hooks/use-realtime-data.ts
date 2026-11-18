"use client";

import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { db, DEFAULT_DEVICE_ID } from "@/lib/firebase";

/**
 * Custom Hook untuk mendengarkan perubahan realtime dari Firebase RTDB
 * @param path - subpath di dalam /devices/{deviceId} atau path kustom (misal "status", "sensors")
 * @param deviceId - ID perangkat ESP32
 */
export function useRealtimeData<T = any>(
  path: string = "",
  deviceId: string = DEFAULT_DEVICE_ID
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const fullPath = path
      ? `devices/${deviceId}/${path}`
      : `devices/${deviceId}`;
    const dbRef = ref(db, fullPath);

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (err) => {
        console.error(`Error mendengarkan path ${fullPath}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    // Bersihkan listener saat komponen unmount
    return () => {
      off(dbRef);
    };
  }, [path, deviceId]);

  return { data, loading, error };
}
