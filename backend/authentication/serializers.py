from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        # Add custom user data
        data['user_id'] = self.user.id
        data['first_name'] = self.user.first_name
        data['is_superuser'] = self.user.is_superuser
        data['role'] = self.user.role

        return data
