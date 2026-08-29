import axios from "axios";
import { CustomError } from "./customError";
import { SERVER_ERROR } from "../constants";

/**
 * Airtel M2M Configuration
 */
const AIRTEL_BASE_URL = process.env.AIRTEL_BASE_URL || "https://m2m.airteliot.co.in/iot/api";

const AIRTEL_AUTH_URL = `${process.env.AIRTEL_BASE_URL}/developer/auth/v2/generate/authtoken`;

const AIRTEL_APIKEY = process.env.AIRTEL_APIKEY;

const AIRTEL_IV_USER = process.env.AIRTEL_IV_USER;

const AIRTEL_CUSTOMER_ID = process.env.AIRTEL_CUSTOMER_ID;

const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID;

const AIRTEL_CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;

/**
 * Token cache
 */
let airtelToken = null;
let airtelTokenExpiry = 0;

/**
 * Get Airtel Access Token
 */
export const getAirtelToken = async () => {
  try {
    /**
     * Use cached token
     */
    if (
      airtelToken &&
      airtelTokenExpiry &&
      Date.now() < airtelTokenExpiry - 60000
    ) {
      return airtelToken;
    }

    /**
     * Validate credentials
     */
    if (!AIRTEL_CLIENT_ID) {
      throw new Error("AIRTEL_CLIENT_ID is missing");
    }

    if (!AIRTEL_CLIENT_SECRET) {
      throw new Error("AIRTEL_CLIENT_SECRET is missing");
    }

    if (!AIRTEL_APIKEY) {
      throw new Error("AIRTEL_APIKEY is missing");
    }

    if (!AIRTEL_IV_USER) {
      throw new Error("AIRTEL_IV_USER is missing");
    }

    /**
     * Request body
     */
    const params = new URLSearchParams();

    params.append("client_id", AIRTEL_CLIENT_ID);

    params.append("client_secret", AIRTEL_CLIENT_SECRET);

    /**
     * Generate token
     */
    const response = await axios.post(AIRTEL_AUTH_URL, params.toString(), {
      headers: {
        accept: "application/json",
        apikey: AIRTEL_APIKEY,
        "iv-user": AIRTEL_IV_USER,
        "Content-Type": "application/x-www-form-urlencoded",
      },

      timeout: 30000,
    });

    const token =
      response?.data?.data?.access_token || response?.data?.access_token;

    if (!token) {
      throw new Error("Airtel access token not received");
    }

    airtelToken = token;

    const expiresIn = Number(
      response?.data?.data?.expires_in || response?.data?.expires_in || 3600,
    );

    airtelTokenExpiry = Date.now() + expiresIn * 1000;

    console.log("AIRTEL TOKEN GENERATED");

    return airtelToken;
  } catch (error) {
    console.log("=================================");

    console.log("AIRTEL TOKEN ERROR");

    console.log("CODE:", error?.code);

    console.log("MESSAGE:", error?.message);

    console.log("STATUS:", error?.response?.status);

    console.log("RESPONSE:", error?.response?.data);

    console.log("=================================");

    throw error;
  }
};

/**
 * Common headers
 */
const getAirtelHeaders = (token) => ({
  accept: "application/json",

  Authorization: `Bearer ${token}`,

  apikey: AIRTEL_APIKEY,

  "customer-id": AIRTEL_CUSTOMER_ID,

  "iv-user": AIRTEL_IV_USER,

  "Content-Type": "application/json",
});

/**
 * Activate SIM
 *
 * {
 *   mobileNo: "51967694502",
 *   planCode: "M2M_PLN_0001"
 * }
 */
export const activateSim = async (params) => {
  try {
    const { sim_number = "", planCode = "" } = params || {};

    if (!sim_number) {
      throw new Error("sim_number is required");
    }

    if (!planCode) {
      throw new Error("planCode is required");
    }

    const token = await getAirtelToken();

    const payload = {
      simDOList: [
        {
          iccid: String(sim_number),
          planDO: {
            planCode: String(planCode),
          },
        },
      ],
    };

    console.log("=================================");

    console.log("AIRTEL SIM ACTIVATION");

    console.log("SIM Number:", sim_number);

    console.log("PLAN CODE:", planCode);

    console.log("=================================");

    const response = await axios.post(
      `${AIRTEL_BASE_URL}/om/job/sim/activate`,

      payload,

      {
        headers: getAirtelHeaders(token),

        timeout: 30000,
      },
    );

    const jobId =
      response?.data?.data?.jobId ||
      response?.data?.jobId ||
      response?.data?.data?.jobID ||
      response?.data?.jobID;

    console.log("AIRTEL ACTIVATION JOB ID:", jobId);

    return {
      success: true,

      action: "ACTIVATE",

      mobileNo,

      planCode,

      jobId,

      data: response?.data,
    };
  } catch (error) {
    console.log("=================================");

    console.log("AIRTEL ACTIVATE ERROR");

    console.log("MESSAGE:", error?.message);

    console.log("STATUS:", error?.response?.status);

    console.log("RESPONSE:", error?.response?.data);

    console.log("=================================");

    throw new CustomError(SERVER_ERROR, error?.response?.data?.trace || error?.message);
    // return {
    //   success: false,

    //   action: "ACTIVATE",

    //   error: error?.response?.data || error?.message,

    //   status: error?.response?.status,
    // };
    
  }
};

/**
 * DEACTIVATE / INACTIVATE SIM
 *
 * IMPORTANT:
 *
 * The exact endpoint/payload for SIM deactivation
 * depends on the Airtel M2M API version enabled
 * for your account.
 *
 * Once your Airtel Swagger confirms the endpoint,
 * put it here.
 */
export const deactivateSim = async (params) => {
  try {
    const { mobileNo = "" } = params || {};

    if (!mobileNo) {
      throw new Error("mobileNo is required");
    }

    const token = await getAirtelToken();

    /**
     * ------------------------------------------------
     * Replace this endpoint with the endpoint from
     * your Airtel M2M API documentation.
     * ------------------------------------------------
     */
    const url = `${AIRTEL_BASE_URL}/job/sim/deactivate`;

    const payload = {
      simDOList: [
        {
          mobileNO: String(mobileNo),
        },
      ],
    };

    console.log("=================================");

    console.log("AIRTEL SIM DEACTIVATION");

    console.log("MOBILE NO:", mobileNo);

    console.log("=================================");

    const response = await axios.post(
      url,

      payload,

      {
        headers: getAirtelHeaders(token),

        timeout: 30000,
      },
    );

    const jobId =
      response?.data?.data?.jobId ||
      response?.data?.jobId ||
      response?.data?.data?.jobID ||
      response?.data?.jobID;

    console.log("AIRTEL DEACTIVATION JOB ID:", jobId);

    return {
      success: true,

      action: "DEACTIVATE",

      mobileNo,

      jobId,

      data: response?.data,
    };
  } catch (error) {
    console.log("=================================");

    console.log("AIRTEL DEACTIVATE ERROR");

    console.log("MESSAGE:", error?.message);

    console.log("STATUS:", error?.response?.status);

    console.log("RESPONSE:", error?.response?.data);

    console.log("=================================");

    return {
      success: false,

      action: "DEACTIVATE",

      mobileNo: params?.mobileNo,

      error: error?.response?.data || error?.message,

      status: error?.response?.status,
    };
  }
};

/**
 * Get Job Status
 */
export const getJobStatus = async (params) => {
  try {
    const { jobId = "" } = params || {};

    if (!jobId) {
      throw new Error("jobId is required");
    }

    const token = await getAirtelToken();

    const response = await axios.get(
      `${AIRTEL_BASE_URL}/job/${jobId}/order`,

      {
        headers: getAirtelHeaders(token),

        timeout: 30000,
      },
    );

    console.log("=================================");

    console.log("AIRTEL JOB STATUS");

    console.log("JOB ID:", jobId);

    console.log("RESPONSE:", response?.data);

    console.log("=================================");

    return {
      success: true,

      jobId,

      data: response?.data,
    };
  } catch (error) {
    console.log("=================================");

    console.log("AIRTEL JOB STATUS ERROR");

    console.log("MESSAGE:", error?.message);

    console.log("STATUS:", error?.response?.status);

    console.log("RESPONSE:", error?.response?.data);

    console.log("=================================");

    return {
      success: false,

      jobId: params?.jobId,

      error: error?.response?.data || error?.message,

      status: error?.response?.status,
    };
  }
};

/**
 * Get INITIAL SIMs
 */
export const getInitialSims = async (params) => {
  try {
    const {
      pageNo = 1,

      pageSize = 100,
    } = params || {};

    const token = await getAirtelToken();

    const response = await axios.get(
      `${AIRTEL_BASE_URL}/details/basket/0/sims`,

      {
        params: {
          pageNo,

          pageSize,

          simStatus: "INITIAL",
        },

        headers: getAirtelHeaders(token),

        timeout: 30000,
      },
    );

    return {
      success: true,

      data: response?.data,
    };
  } catch (error) {
    console.log(
      "AIRTEL SIM LIST ERROR:",
      error?.response?.data || error?.message,
    );

    return {
      success: false,

      error: error?.response?.data || error?.message,

      status: error?.response?.status,
    };
  }
};

/**
 * Get Plans
 */
export const getPlans = async () => {
  try {
    const token = await getAirtelToken();

    const response = await axios.get(
      `${AIRTEL_BASE_URL}/details/plans`,

      {
        headers: getAirtelHeaders(token),

        timeout: 30000,
      },
    );

    return {
      success: true,

      data: response?.data,
    };
  } catch (error) {
    console.log("AIRTEL PLANS ERROR:", error?.response?.data || error?.message);

    return {
      success: false,

      error: error?.response?.data || error?.message,

      status: error?.response?.status,
    };
  }
};

export const getAllAirtelSimList = async () => {
  try {
    const token = await getAirtelToken();

    const allSims = [];
    const pageSize = 100;
    let pageNo = 1;

    while (true) {
      const response = await axios.get(
        `${AIRTEL_BASE_URL}/customer/details/basket/0/sims`,
        {
          headers: getAirtelHeaders(token),
          params: {
            pageNo,
            pageSize,
          },
          timeout: 30000,
        }
      );

      const sims = response?.data?.data?.sims || [];

      allSims.push(...sims);

      console.log(
        `Airtel SIM inventory: page=${pageNo}, fetched=${sims.length}, total=${allSims.length}`
      );

      // Last page
      if (sims.length < pageSize) {
        break;
      }

      pageNo++;
    }

    return allSims;
  } catch (error) {
    console.log(
      "AIRTEL SIM INVENTORY ERROR:",
      error?.response?.data || error?.message
    );

    return {
      success: false,
      error: error?.response?.data || error?.message,
      status: error?.response?.status,
    };
  }
};