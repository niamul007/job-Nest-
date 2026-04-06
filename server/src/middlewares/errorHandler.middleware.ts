import ApiResponse from "../utils/ApiResponse";

export const errorHandler = (err: any, req: any, res: any) => {
  console.error(err);
  res.status(500).json(ApiResponse.error("Internal Server Error"));
}