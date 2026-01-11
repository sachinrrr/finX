import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    setData(undefined);

    try {
      const response = await cb(...args);

      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success === false
      ) {
        throw new Error(response.error || "Request failed");
      }

      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      setData(undefined);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;