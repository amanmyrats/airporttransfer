import datetime
import logging

from django.contrib.auth.hashers import make_password
from django.http import HttpResponse

from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.utils import timezone

from common.utils import transform_choices_to_key_value_pairs, clean_csv_file
from .serializers import (
    EuroRateModelSerializer, PopularRouteModelSerializer, 
)
from .models import (
    EuroRate, PopularRoute,
)
from .filtersets import (
    EuroRateFilterSet, PopularRouteFilterSet
)
from .resources import PopularRouteModelResource


logger = logging.getLogger("airporttransfer")

class EuroRateModelViewSet(viewsets.ModelViewSet):
    queryset = EuroRate.objects.all()
    serializer_class = EuroRateModelSerializer
    filterset_class = EuroRateFilterSet
    search_fields = ('currency_code', 'euro_rate',)
    ordering_fields = ('currency_code', 'euro_rate',)
    ordering = ('currency_code',)

    def get_authenticators(self):
        if self.request.resolver_match.view_name.endswith('list'):
            # Skip authentication for 'list' action
            return []
        # Use default authentication classes for other actions
        return super().get_authenticators()
    

class PopularRouteModelViewSet(viewsets.ModelViewSet):
    queryset = PopularRoute.objects.all()
    serializer_class = PopularRouteModelSerializer
    filterset_class = PopularRouteFilterSet
    search_fields = ('main_location', 'destination', 'car_type',)
    ordering_fields = ('main_location', 'destination', 'car_type',)
    ordering = ('main_location', 'car_type', 'euro_price', 'destination',)

    def get_authenticators(self):
        if self.request.resolver_match.view_name.endswith('list'):
            # Skip authentication for 'list' action
            return []
        # Use default authentication classes for other actions
        return super().get_authenticators()

    @action(detail=False, methods=["get"])
    def export(self, request, *args, **kwargs):
        # Use the same queryset as for list view, but without pagination
        queryset = self.filter_queryset(self.get_queryset())
        export_excel_name = "overall"
        logger.debug(f"export_excel_name: {export_excel_name}")
        # print(f"export_excel_name: {export_excel_name}")

        # Export data using the resource
        resource = PopularRouteModelResource()
        dataset = resource.export(queryset=queryset[:1000])

        # Always export as CSV
        export_data = dataset.csv
        content_type = "text/csv"
        extension = "csv"
        response_data = export_data.encode("utf-8")
        # print(f"response_data: {response_data}")
        # Use HttpResponse for binary data to avoid any encoding issues
        response = HttpResponse(response_data, content_type=content_type)
        response["Content-Disposition"] = (
            f'attachment; filename="{export_excel_name}-popular_routes.{extension}"'
        )
        response["Access-Control-Expose-Headers"] = (
            "Content-Disposition"  # Required for CORS
        )
        # print(f"response: {response}")
        return response

    @action(detail=False, methods=["post"])
    def import_data(self, request, *args, **kwargs):
        resource = PopularRouteModelResource()
        logger.debug(f"resource: {resource}")
        file = request.FILES.get("file")
        logger.debug(f"file: {file}")

        if not file:
            return Response(
                {"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        dataset = clean_csv_file(file)
        total_rows = len(dataset)
        logger.debug(f"Total rows to import: {total_rows}")

        # logger.debug(f"dataset: {dataset}")
        result = resource.import_data(
            dataset, dry_run=True)  # Dry run to check for errors

        if result.has_errors():
            return Response(
                {"errors": f"{str(result.error_rows[0].errors)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            resource.import_data(
                dataset, dry_run=False)
            logger.debug(f"Imported data successfully")
        except Exception as e:
            logger.error(f"Error importing data: {e}")
            return Response(
                {"error": f"Error importing data: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"status": "successfully imported"}, status=status.HTTP_200_OK)


class CurrencyChoicesAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        return Response(
            transform_choices_to_key_value_pairs(EuroRate.CURRENCY_CHOICES), 
            status=status.HTTP_200_OK)


class MainLocationChoicesAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        return Response(
            transform_choices_to_key_value_pairs(PopularRoute.MAIN_LOCATION_CHOICES), 
            status=status.HTTP_200_OK)
    

class CarTypeChoicesAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        return Response(
            transform_choices_to_key_value_pairs(PopularRoute.CAR_TYPE_CHOICES), 
            status=status.HTTP_200_OK)