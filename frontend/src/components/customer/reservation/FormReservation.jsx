import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Destination {
  id: number;
  name: string;
  city: string;
  country: string;
}

interface Flight {
  id: number;
  name: string;
  description: string;
  prix: number;
  status: string;
  startAt: string;
  endAt: string;
  origin: Destination;
  destination: Destination;
}

interface ReservationFormProps {
  agency: {
    id: number;
    name: string;
    location: string;
  };
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  passenger: {
    id: number;
    firstName: string;
    lastName: string;
    typeDocument: string;
    numDocument: string;
  };
  flight: Flight;
  returnFlight?: Flight;
  onSubmit: (data: any) => void;
}

interface ReservationFormData {
  agencyId: number;
  userId: number;
  customerId: number;
  startAt: string;
  endAt: string;
  tripType: 'one-way' | 'round-trip';
  volId: number;
  returnVolId?: number;
  startDestinationId: number;
  endDestinationId: number;
  description: string;
  status: string;
}

export function ReservationForm({
  agency,
  customer,
  passenger,
  flight,
  returnFlight,
  onSubmit
}: ReservationFormProps) {
  const form = useForm<ReservationFormData>({
    defaultValues: {
      agencyId: agency.id,
      customerId: customer.id,
      volId: flight.id,
      returnVolId: returnFlight?.id,
      startDestinationId: flight.origin.id,
      endDestinationId: flight.destination.id,
      startAt: flight.startAt,
      endAt: returnFlight?.endAt || flight.endAt,
      tripType: returnFlight ? 'round-trip' : 'one-way',
      status: 'pending',
      description: '',
    }
  });

  const handleSubmit = (data: ReservationFormData) => {
    // Add createdAt, updatedAt timestamps
    const finalData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: customer.id, // Using customer ID as creator for this example
      updatedBy: customer.id,
    };
    onSubmit(finalData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Agency and Customer Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Agency</h3>
                <p>{agency.name}</p>
                <p className="text-sm text-muted-foreground">{agency.location}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Customer</h3>
                <p>{customer.firstName} {customer.lastName}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </div>

            {/* Passenger Information */}
            <div>
              <h3 className="font-semibold mb-2">Passenger</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p>{passenger.firstName} {passenger.lastName}</p>
                <p className="text-sm text-muted-foreground">
                  {passenger.typeDocument}: {passenger.numDocument}
                </p>
              </div>
            </div>

            {/* Flight Details */}
            <div>
              <h3 className="font-semibold mb-2">Flight Information</h3>
              <div className="space-y-4">
                {/* Outbound Flight */}
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium">Outbound Flight: {flight.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p>{flight.origin.city}, {flight.origin.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">To</p>
                      <p>{flight.destination.city}, {flight.destination.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Departure</p>
                      <p>{formatDate(flight.startAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Arrival</p>
                      <p>{formatDate(flight.endAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Return Flight if exists */}
                {returnFlight && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium">Return Flight: {returnFlight.name}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">From</p>
                        <p>{returnFlight.origin.city}, {returnFlight.origin.country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">To</p>
                        <p>{returnFlight.destination.city}, {returnFlight.destination.country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Departure</p>
                        <p>{formatDate(returnFlight.startAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Arrival</p>
                        <p>{formatDate(returnFlight.endAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trip Type */}
            <FormField
              control={form.control}
              name="tripType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trip type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one-way">One Way</SelectItem>
                      <SelectItem value="round-trip">Round Trip</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Price Summary */}
            <div>
              <h3 className="font-semibold mb-2">Price Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Outbound Flight</span>
                  <span>{formatCurrency(flight.prix)}</span>
                </div>
                {returnFlight && (
                  <div className="flex justify-between">
                    <span>Return Flight</span>
                    <span>{formatCurrency(returnFlight.prix)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>
                    {formatCurrency(returnFlight 
                      ? flight.prix + returnFlight.prix
                      : flight.prix
                    )}
                  </span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Confirm Reservation
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}