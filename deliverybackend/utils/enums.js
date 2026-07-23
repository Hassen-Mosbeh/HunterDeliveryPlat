const Roles = {
  ADMIN: 0,
  CLIENT: 1,
  DRIVER: 2,
  RESTAURANT: 3,
};

const UserStatus = {
  ACTIVE: 1,
  INACTIVE: 0,
};

const AvailabilityStatus = {
  AVAILABLE: 1,
  UNAVAILABLE: 0,
};

const OrderStatus = {
  PENDING: 0,
  PREPARING: 1,
  READY_FOR_PICKUP: 2,
  CANCELLED: 3,
  DELIVERED: 4,
};

const PaymentStatus = {
  PENDING: 0,
  PAID: 1,
  FAILED: 2,
  REFUNDED: 3,
};

const PaymentMethod = {
  CASH: 0,
  CARD: 1,
};

module.exports = { Roles, UserStatus, AvailabilityStatus, OrderStatus, PaymentStatus, PaymentMethod };
