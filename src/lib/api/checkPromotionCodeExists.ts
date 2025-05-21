import axios from "axios";

export const checkPromotionCodeExists = async (code: string): Promise<boolean> => {
  if (!code) {
    return false;
  }
  const res = await axios.get(`/api/promotions/check-code?code=${code.toLowerCase()}`);
  return res.data.exists;
};
