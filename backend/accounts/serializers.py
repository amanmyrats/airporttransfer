from django.contrib.auth.hashers import make_password

from rest_framework import serializers

from .models import Account, Role, AccountRole, UserColumn
from .utils import sendpassword_task

class RoleModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


class AccountRoleModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountRole
        fields = '__all__'


class AccountModelSerializer(serializers.ModelSerializer):
    role = serializers.IntegerField(write_only=True, required=False)
    role_name = serializers.CharField(read_only=True, source='account_role.role_name')
    email = serializers.EmailField(required=False)

    class Meta:
        model = Account
        fields = (
            'id', 'email', 'first_name', 'last_name', 
            'phone', 
            'is_active', 'is_staff', 'is_superuser', 'date_joined', 
            'role', 'role_name')
        read_only_fields = ('is_active', 'is_staff', 'is_superuser', 'date_joined', 'role_name',)

    def get_role(self, obj):
        if hasattr(obj, 'account_role'):
            return obj.account_role.role.id
        return None

    def create(self, validated_data):
        role_id = validated_data.pop('role', None)
        password = Account.objects.make_random_password()
        # password = make_password(validated_data.get('email'))
        validated_data['password'] = make_password(password)
        account = super().create(validated_data)
        if role_id:
            role = Role.objects.get(id=role_id)
            AccountRole.objects.create(account=account, role=role)
            sendpassword_task(account.email, password)
        return account
    
    def update(self, instance, validated_data):
        role_id = validated_data.pop('role', None)
        if role_id:
            role = Role.objects.get(id=role_id)
            if hasattr(instance, 'account_role'):
                instance.account_role.role = role
                instance.account_role.save()
            else:
                AccountRole.objects.create(account=instance, role=role)
        return super().update(instance, validated_data)
    
    def to_representation(self, instance):
        # Custom representation to include role information in the output
        representation = super().to_representation(instance)
        if hasattr(instance, 'account_role'):
            representation['role'] = instance.account_role.role.id
        else:
            representation['role'] = None
        return representation
    

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