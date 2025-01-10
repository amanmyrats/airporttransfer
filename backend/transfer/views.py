import logging

from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from .serializers import (
    ReservationModelSerializer,
    ReservationStatusModelSerializer,
)
from .models import (
    Reservation,
)
from .filtersets import (
    ReservationFilterSet,
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
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def statuses(self, request, *args, **kwargs):
        statuses = Reservation.STATUS_CHOICES
        statuses = [{"value": status[0], "label": status[1]} for status in statuses]
        return Response(statuses, status=status.HTTP_200_OK)
