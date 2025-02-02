import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatCurrency } from "@/lib/utils";

interface ReservationFormProps {
  agency: any;
  customer: any;
  passenger: any;
  flight: any;
  returnFlight?: any;
  destinations: any[];
  onSubmit: (data: any) => void;
}

export function ReservationForm({
  agency,
  customer,
  passenger,
  flight,
  returnFlight,
  onSubmit
}: ReservationFormProps) {
  const form = useForm({
    defaultValues: {
      description: "",
    }
  });

  const totalPrice = returnFlight 
    ? flight.prix + returnFlight.prix
    : flight.prix;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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

            <div>
              <h3 className="font-semibold mb-2">Passenger</h3>
              <p>{passenger.firstName} {passenger.lastName}</p>
              <p className="text-sm text-muted-foreground">
                {passenger.typeDocument}: {passenger.numDocument}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Flight Details</h3>
            <div className="space-y-4">
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
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}