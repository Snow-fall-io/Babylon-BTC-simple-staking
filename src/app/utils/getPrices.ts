import { apiWrapper } from "@/app/api/apiWrapper";
import { ClientError } from "@/app/errors";
import { ERROR_CODES } from "@/app/errors/codes";
interface PricesResponse {
  data: Record<string, number>;
}

export const getPrices = async (): Promise<Record<string, number>> => {
  try {
    const response = await apiWrapper<PricesResponse>(
      "GET",
      "/v2/prices",
      "Error getting prices",
    );
    const pricesResponse: PricesResponse = response.data;
    return pricesResponse.data;
  } catch (error) {
    throw new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      "Error getting prices",
      {
        cause: error as Error,
      },
    );
  }
};
