import logging

from django.http import HttpResponse
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404

from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from common.utils import transform_choices_to_key_value_pairs
from .serializers import (
    ReservationModelSerializer,
    ReservationStatusModelSerializer, 
    ContactUsMessageModelSerializer,
)
from .models import (
    Reservation, ContactUsMessage, 
)
from .filtersets import (
    ReservationFilterSet, ContactUsMessageFilterSet, 
)
from .resources import (
    ReservationModelResource,
)


logger = logging.getLogger("airporttransfer")


class ReservationModelViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationModelSerializer
    filterset_class = ReservationFilterSet
    search_fields = (
        "number",
        "status",
        "flight_number",
        "passenger_name",
        "passenger_count",
        "note",
        "pickup_short",
        "pickup_full",
        "dest_short",
        "dest_full",
    )
    ordering_fields = (
        "-reservation_date",
        "-transfer_date",
        "transfer_time",
        "number",
        "status",
        "pickup_short",
        "pickup_full",
        "dest_short",
        "dest_full",
    )
    ordering = (
        "-reservation_date",
        "-transfer_date",
        "transfer_time",
        "number",
        "status",
        "pickup_short",
        "pickup_full",
        "dest_short",
        "dest_full",
    )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status in [
            "confirmed",
        ]:
            raise ValidationError("Onaylanmış rezervasyonlar güncellenemez.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status in [
            "confirmed",
        ]:
            raise ValidationError("Onaylanmış rezervasyonlar güncellenemez.")
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status in [
            "confirmed",
        ]:
            raise ValidationError("Onaylanmış rezervasyonlar silinemez.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='number/(?P<reservation_number>[^/.]+)')
    def get_by_reservation_number(self, request, reservation_number=None):
        reservation = get_object_or_404(Reservation, number=reservation_number)
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def export(self, request, *args, **kwargs):
        # Use the same queryset as for list view, but without pagination
        queryset = self.filter_queryset(self.get_queryset())
        export_excel_name = "overall"
        logger.debug(f"export_excel_name: {export_excel_name}")

        # Export data using the resource
        resource = ReservationModelResource()
        dataset = resource.export(queryset=queryset[:1000])

        # Always export as CSV
        export_data = dataset.csv
        content_type = "text/csv"
        extension = "csv"
        response_data = export_data.encode("utf-8")

        # Use HttpResponse for binary data to avoid any encoding issues
        response = HttpResponse(response_data, content_type=content_type)
        response["Content-Disposition"] = (
            f'attachment; filename="{export_excel_name}-rezervasyonlar.{extension}"'
        )
        response["Access-Control-Expose-Headers"] = (
            "Content-Disposition"  # Required for CORS
        )

        return response

    @action(detail=True, methods=["put"])
    def update_status(self, request, pk=None):
        serializer = ReservationStatusModelSerializer(
            instance=self.get_object(), data=request.data, partial=True
        )
        if serializer.is_valid(raise_exception=True):
            reservation = serializer.save()
            serialized_data = ReservationModelSerializer(reservation).data
            return Response(serialized_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def statuses(self, request, *args, **kwargs):
        statuses = Reservation.STATUS_CHOICES
        statuses = [{"value": status[0], "label": status[1]} for status in statuses]
        return Response(statuses, status=status.HTTP_200_OK)


class StatusChoicesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(
            transform_choices_to_key_value_pairs(Reservation.STATUS_CHOICES),
            status=status.HTTP_200_OK,
        )
    

class BookingCreateAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = ReservationModelSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            greet_with_flower = serializer.validated_data.get("greet_with_flower")
            greet_with_champagne = serializer.validated_data.get("greet_with_champagne")
            note = serializer.validated_data.get("note")

            if greet_with_flower or greet_with_champagne:
                # Add the note to the serializer's data
                serializer.validated_data["note"] = f"{note or ''}\n" \
                    f"{'ARRIVAL transferinde Çiçek ile karşılanacak.' if greet_with_flower else ''}\n" \
                    f"{'ARRIVAL transferinde Şampanya ile karşılanacak.' if greet_with_champagne else ''}"
            reservation = serializer.save()

            is_round_trip = serializer.validated_data.get("is_round_trip")
            if is_round_trip:
                round_trip_data = request.data.copy()
                round_trip_data["transfer_date"] = serializer.validated_data.get(
                    "return_transfer_date"
                )
                round_trip_data["transfer_time"] = serializer.validated_data.get(
                    "return_transfer_time"
                )
                round_trip_data["amount"] = serializer.validated_data.get("return_trip_amount")
                round_trip_data["pickup_short"] = serializer.validated_data.get(
                    "dest_short"
                )
                round_trip_data["pickup_full"] = serializer.validated_data.get(
                    "dest_full"
                )
                round_trip_data["dest_short"] = serializer.validated_data.get(
                    "pickup_short"
                )
                round_trip_data["dest_full"] = serializer.validated_data.get(
                    "pickup_full"
                )
                note = serializer.validated_data.get("note")
                if greet_with_flower or greet_with_champagne:
                    round_trip_data["note"] = note

                round_trip_serializer = ReservationModelSerializer(data=round_trip_data)
                if round_trip_serializer.is_valid(raise_exception=True):
                    round_trip_reservation = round_trip_serializer.save()
                    return Response(
                        {
                            "one_way": serializer.data,
                            "return": round_trip_serializer.data,
                        },
                        status=status.HTTP_201_CREATED,
                    )
            return Response({"one_way": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingUpdateAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def put(self, request, *args, **kwargs):
        try:
            reservation = get_object_or_404(Reservation, pk=kwargs["pk"])
            serializer = ReservationModelSerializer(
                instance=reservation, data=request.data, partial=True
            )
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactUsModelViewSet(viewsets.ModelViewSet):
    queryset = ContactUsMessage.objects.all()
    serializer_class = ContactUsMessageModelSerializer
    filterset_class = ContactUsMessage
    

class SendMessageAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = ContactUsMessageModelSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()


# DEFAULT_FROM_EMAIL = 'info@transfertakip.com'

# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = os.getenv('EMAIL_HOST_TRANSFERTAKIP')
# EMAIL_PORT = os.getenv('EMAIL_PORT_TRANSFERTAKIP')
# # EMAIL_USE_TLS = True
# EMAIL_USE_TLS = False
# EMAIL_USE_SSL = True
# EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER_TRANSFERTAKIP')
# EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD_TRANSFERTAKIP')

            # send mail to info@transfertakip.com
            subject = f"Contact Us Message from {serializer.data.get('email')} - {serializer.data.get('name')}"
            message = f"""
Name: {serializer.data.get('name')} 
Email: {serializer.data.get('email')}
Phone: {serializer.data.get('phone')}
Message: {serializer.data.get('message')}
"""
            send_mail(
                subject, 
                message,
                settings.EMAIL_HOST_USER, 
                ['amansarahs@gmail.com', 'deryamyrat899@gmail.com']
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
