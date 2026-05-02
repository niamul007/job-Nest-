/**
 * ApiResponse — utility class for consistent HTTP response formatting.
 * Used across all controllers to ensure every response has the same shape.
 * Frontend can always check success: true/false to handle responses.
 *
 * Static methods — no instance needed, call directly on the class.
 */
export default class ApiResponse {

  /**
   * Wraps successful response data in a standard shape.
   * Generic <T> accepts any data type — Job, User, Application[], null etc.
   * data is optional — some success responses have no data (e.g. delete).
   */
  static success<T>(message: string, data?: T) {
    return { success: true, message, data }
  }

  /**
   * Wraps error message in a standard shape.
   * No data field — errors only need a message.
   */
  static error(message: string) {
    return { success: false, message }
  }
}