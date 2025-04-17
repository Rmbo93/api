const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  address: { type: String },
  profileImage: { type: String },
  emergencyContact: { type: String },
  
  vehicleType: { type: String, enum: ["bicycle", "motorbike", "car"] },
  vehicleImage: { type: String },
  vehicleColor: { type: String },
  plateNumber: { type: String },
  vehicleBrand: { type: String },
  vehicleModel: { type: String },
  fuelType: { type: String, enum: ["gasoline", "diesel", "electric"] },
  maxPassengers: { type: Number },
  vehicleCondition: { type: String, enum: ["new", "needs maintenance", "not usable"] },
  insuranceImage: { type: String },
  contractImage: { type: String },
  licenseImage: { type: String },
  mechanicImage: { type: String },

  insuranceExpiry: { type: Date },
  mechanicExpiry: { type: Date },
  licenseExpiry: { type: Date },
  ridePreferences: [{ type: String, enum: ['VIP', 'Okonomi'] }],
  expoPushToken: { type: String },
  
  isOnline: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },

  avgSpeed: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  completedRides: { type: Number, default: 0 },
  lastRideDate: { type: Date },
  totalEarnings: { type: Number, default: 0 },

  workZones: [{ type: String }],
  complaints: { type: Number, default: 0 },
  rewards: { type: Number, default: 0 },
  nightMode: { type: Boolean, default: false },
  appUsageCount: { type: Number, default: 0 },

  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Rider", riderSchema);
