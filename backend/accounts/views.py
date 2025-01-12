from django.shortcuts import render
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode 
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator

from rest_framework import viewsets, views, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from core.permissions import IsCompanyYonetici
from accounts.utils import sendpassword_task, make_random_password
from accounts.models import Account, UserColumn
from accounts.filtersets import AccountFilterSet, UserColumnFilterSet
from accounts.serializers import (
    AccountModelSerializer, ChangePasswordSerializer, ProfileSerializer, 
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer, 
    UserColumnModelSerializer, 
)


class AccountModelViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    filterset_class = AccountFilterSet
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['email', 'first_name', 'last_name']
    ordering = ['email', 'first_name', 'last_name']
    permission_classes = [IsCompanyYonetici]

    def get_serializer_class(self):
        if self.action == 'changepassword':
            return ChangePasswordSerializer
        elif self.action == 'passwordreset':
            return PasswordResetRequestSerializer
        elif self.action == 'passwordresetconfirm':
            return PasswordResetConfirmSerializer
        return AccountModelSerializer

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Account.objects.all()
        return Account.objects.none()
    
    @action(detail=False, methods=['post'], url_path='changepassword')
    def changepassword(self, request):
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            confirm_password = serializer.validated_data['confirm_password']
            if new_password != confirm_password:
                return Response({'status': 'Yeni şifrenizi iki yere de doğru yazmanız gerekiyor.'}, status=status.HTTP_400_BAD_REQUEST)
            if user.check_password(old_password):
                user.set_password(new_password)
                user.save()
                return Response({'status': 'Şifreniz başarıyla değiştirildi.'})
            else:
                return Response({'status': 'Şuanda kullandığınız şifreyi hatalı yazdınız.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='activatedeactivate')
    def activatedeactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        password = make_random_password()
        user.set_password(password)
        user.save()
        sendpassword_task(user.email, password)
        return Response({'status': 'Kullanıcı başarıyla aktif/deaktif edildi.'})

    @action(detail=False, methods=['get'], url_path='userdetail')
    def userdetail(self, request, pk=None):
        user = self.request.user
        data = AccountModelSerializer(user).data
        return Response(data)


class PublicAccountModelViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    filterset_class = AccountFilterSet
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['email', 'first_name', 'last_name']
    ordering = ['email', 'first_name', 'last_name']
    authentication_classes = []
    permission_classes = []
    
    def list(self, request):
        return Response({'detail': 'Bu işlemi yapmaya yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
    
    def retrieve(self, request, pk=None):
        return Response({'detail': 'Bu işlemi yapmaya yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
    
    def create(self, request):
        return Response({'detail': 'Bu işlemi yapmaya yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
    
    def update(self, request, pk=None):
        return Response({'detail': 'Bu işlemi yapmaya yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
    
    def partial_update(self, request, pk=None):
        return Response({'detail': 'Bu işlemi yapmaya yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
    
    def destroy(self, request, pk=None):
        return Response({'detail': 'Bu işlemi yapmaya yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
    
    def get_serializer_class(self):
        if self.action == 'passwordreset':
            return PasswordResetRequestSerializer
        elif self.action == 'passwordresetconfirm':
            return PasswordResetConfirmSerializer
        return AccountModelSerializer

    @action(detail=False, methods=['post'])
    def passwordreset(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = Account.objects.get(email=email)
            except Account.DoesNotExist:
                return Response({'detail': 'No user with this email found.'}, status=status.HTTP_400_BAD_REQUEST)
            
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_link = f"{settings.FRONTEND_URL}/passwordresetconfirm/?uid={uid}&token={token}"
            mail_subject = 'Reset your password'
            message = f"""
        Merhaba, 
        Şifrenizi sıfırlamak için aşağıdaki linke tıklayınız:
        {reset_link}
        """
            send_mail(mail_subject, message, settings.EMAIL_HOST_USER, [user.email])
            return Response({'detail': 'Password reset link sent.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def passwordresetconfirm(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data['uid']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                uid = urlsafe_base64_decode(uid).decode()
                user = Account.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, Account.DoesNotExist):
                user = None
            if user is not None and default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'detail': 'Password has been reset.'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Invalid token or user ID.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileAPIView(views.APIView):
    def put(self, request):
        user = request.user
        serializer = ProfileSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        user = request.user
        serializer = ProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UserColumnModelViewSet(viewsets.ModelViewSet):
    queryset = UserColumn.objects.all()
    serializer_class = UserColumnModelSerializer
    ordering_fields = ['user', 'table_name', 'index', 'field', 'header', 'width']
    ordering = ['user', 'table_name', 'index', 'field', 'header', 'width']
    search_fields = ['user__email', 'table_name', 'field', 'header']
    filterset_class = UserColumnFilterSet

    # Disable authentication for this viewset
    # authentication_classes = []
    # permission_classes = [AllowAny]

    def get_queryset(self):
        current_user = self.request.user

        if current_user:
            return UserColumn.objects.filter(user=current_user)
        return UserColumn.objects.all()

    @action(detail=False, methods=['post'], url_path='bulkcreate')
    def bulkcreate(self, request):  
        current_user = request.user
        # Modify the input data before passing it to the serializer
        data = request.data
        print(f"Data: {data}")
        # Add the current user's user ID and table name to each item in the bulk request
        for item in data:
            item['user'] = current_user.id
        serializer = UserColumnModelSerializer(data=data, many=True)
        if serializer.is_valid():
            serializer.save()
            # return all columns for the current user
            serialized_data_to_return = UserColumnModelSerializer(
                UserColumn.objects.filter(
                    user=current_user, 
                    table_name=data[0]['table_name']
                    ), 
                    many=True)
            return Response(serialized_data_to_return.data)
        print(f"Serializer error: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['put'], url_path='bulkupdate')
    def bulkupdate(self, request):
        current_user = request.user
        columns = request.data
        print('columns:', columns)

        # Iterate through columns and update or create UserColumn records
        for column_data in columns:
            UserColumn.objects.update_or_create(
                id=column_data['id'],
                user=current_user,
                field=column_data['field'],
                defaults={
                    'table_name': column_data['table_name'],
                    'header': column_data['header'],
                    'index': column_data['index'],
                    'width': column_data['width'],
                    'is_visible': column_data['is_visible'],
                }
            )

        return Response({"message": "Column orders saved successfully."}, status=status.HTTP_200_OK)
    

class RoleChoicesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        from common.utils import transform_choices_to_key_value_pairs
        return Response(
            transform_choices_to_key_value_pairs(Account.ROLE_CHOICES), 
            status=status.HTTP_200_OK)