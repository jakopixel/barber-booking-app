CREATE TABLE "User" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'client',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Shop" (
  "id" SERIAL NOT NULL,
  "ownerId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "lat" DOUBLE PRECISION,
  "lng" DOUBLE PRECISION,
  "openingHours" TEXT,
  "photo" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Barber" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "shopId" INTEGER,
  "shopName" TEXT NOT NULL,
  "bio" TEXT,
  "photo" TEXT,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "specialty" TEXT NOT NULL,
  "lat" DOUBLE PRECISION,
  "lng" DOUBLE PRECISION,
  "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
  "subscriptionEndDate" TIMESTAMP(3),
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,

  CONSTRAINT "Barber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Barber_userId_key" ON "Barber"("userId");
CREATE UNIQUE INDEX "Barber_stripeCustomerId_key" ON "Barber"("stripeCustomerId");
CREATE UNIQUE INDEX "Barber_stripeSubscriptionId_key" ON "Barber"("stripeSubscriptionId");

CREATE TABLE "Service" (
  "id" SERIAL NOT NULL,
  "barberId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "duration" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "description" TEXT,

  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Appointment" (
  "id" SERIAL NOT NULL,
  "clientId" INTEGER NOT NULL,
  "barberId" INTEGER NOT NULL,
  "serviceId" INTEGER NOT NULL,
  "dateTime" TIMESTAMP(3) NOT NULL,
  "duration" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" SERIAL NOT NULL,
  "appointmentId" INTEGER NOT NULL,
  "clientId" INTEGER NOT NULL,
  "barberId" INTEGER NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_appointmentId_key" ON "Review"("appointmentId");

CREATE TABLE "Subscription" (
  "id" SERIAL NOT NULL,
  "barberId" INTEGER NOT NULL,
  "plan" TEXT NOT NULL DEFAULT 'monthly',
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 15,
  "status" TEXT NOT NULL DEFAULT 'active',
  "stripeSubscriptionId" TEXT NOT NULL,

  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_barberId_key" ON "Subscription"("barberId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

ALTER TABLE "Shop" ADD CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Barber" ADD CONSTRAINT "Barber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Barber" ADD CONSTRAINT "Barber_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Service" ADD CONSTRAINT "Service_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
