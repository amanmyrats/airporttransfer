from django.contrib.auth.hashers import make_password

from rest_framework import serializers

from .models import Account, UserColumn
from .utils import sendpassword_task, make_random_password


class AccountModelSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)

    class Meta:
        model = Account
        fields = (
            'id', 'email', 'first_name', 'last_name', 
            'phone', 
            'is_active', 'is_staff', 'is_superuser', 'date_joined', 
            'role')
        read_only_fields = ('is_active', 'is_staff', 'is_superuser', 'date_joined',)

    def create(self, validated_data):
        try:
            password = make_random_password()
            # password = make_password(validated_data.get('email'))
            validated_data['password'] = make_password(password)
            account = super().create(validated_data)
            sendpassword_task(account.email, password)

        except Exception as e:
            print(e)
            raise serializers.ValidationError('Failed to create account.')
        return account
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser', 'date_joined', )
        read_only_fields = ('email', 'is_active', 'is_staff', 'is_superuser', 'date_joined', )


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    uid = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)


class UserColumnModelSerializer(serializers.ModelSerializer):
    user_obj = AccountModelSerializer(read_only=True, source='user')
    
    class Meta:
        model = UserColumn
        fields = '__all__'