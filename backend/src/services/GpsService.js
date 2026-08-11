/**
 * GPS Integration Provider Abstraction
 * Default provider for unconfigured live tracking.
 */
export class GpsService {
  static async getVehicleLocation(vehicleId) {
    return {
      integrationConfigured: false,
      status: 'unconfigured',
      message: 'GPS Provider integration not configured. Live GPS tracking is coming soon.',
      location: null,
    };
  }

  static async getRouteProgress(routeId) {
    return {
      integrationConfigured: false,
      status: 'unconfigured',
      message: 'GPS Provider integration not configured.',
      progressPercentage: 0,
    };
  }

  static async getEstimatedArrival(stopId) {
    return {
      integrationConfigured: false,
      status: 'unconfigured',
      message: 'GPS Provider integration not configured.',
      etaMinutes: null,
    };
  }

  static async getLocationHistory(vehicleId, date) {
    return {
      integrationConfigured: false,
      status: 'unconfigured',
      waypoints: [],
    };
  }
}
