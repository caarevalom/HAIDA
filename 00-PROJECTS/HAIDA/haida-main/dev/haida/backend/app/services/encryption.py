"""
Encryption service for securing sensitive data like credentials and tokens.
Uses Fernet for symmetric encryption.
"""

import os
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64


class EncryptionService:
    """Service for encrypting and decrypting sensitive configuration values."""

    def __init__(self, master_key: Optional[str] = None):
        """
        Initialize encryption service.

        Args:
            master_key: Master encryption key. If not provided, uses ENCRYPTION_KEY env var.
                       If neither available, generates a new one.
        """
        self.master_key = master_key or os.getenv("ENCRYPTION_KEY")

        if not self.master_key:
            # Generate a new key for development
            self.master_key = Fernet.generate_key().decode()

        # Ensure key is in bytes
        if isinstance(self.master_key, str):
            key_bytes = self.master_key.encode()
        else:
            key_bytes = self.master_key

        # Derive key using PBKDF2 if needed
        if len(base64.urlsafe_b64decode(key_bytes)) != 32:
            self._cipher = self._derive_key(key_bytes)
        else:
            try:
                self._cipher = Fernet(key_bytes)
            except Exception:
                self._cipher = self._derive_key(key_bytes)

    @staticmethod
    def _derive_key(password: bytes) -> Fernet:
        """Derive a Fernet key from a password."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"haida_salt_v1",  # In production, use random salt stored with cipher
            iterations=100000,
            backend=default_backend(),
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        return Fernet(key)

    def encrypt(self, value: str) -> str:
        """
        Encrypt a string value.

        Args:
            value: String to encrypt

        Returns:
            Encrypted string (base64 encoded)
        """
        if not isinstance(value, str):
            value = str(value)

        encrypted = self._cipher.encrypt(value.encode())
        return encrypted.decode()

    def decrypt(self, encrypted_value: str) -> str:
        """
        Decrypt an encrypted string value.

        Args:
            encrypted_value: Encrypted string to decrypt

        Returns:
            Decrypted string

        Raises:
            InvalidToken: If decryption fails
        """
        try:
            if isinstance(encrypted_value, str):
                encrypted_value = encrypted_value.encode()

            decrypted = self._cipher.decrypt(encrypted_value)
            return decrypted.decode()
        except InvalidToken:
            raise ValueError("Failed to decrypt value. Invalid key or corrupted data.")

    def is_encrypted(self, value: str) -> bool:
        """Check if a value appears to be encrypted."""
        if not value or not isinstance(value, str):
            return False
        try:
            # Fernet tokens start with specific format
            return value.startswith("gAAAAAA")
        except Exception:
            return False


# Global instance
_encryption_service: Optional[EncryptionService] = None


def get_encryption_service(master_key: Optional[str] = None) -> EncryptionService:
    """Get or create the global encryption service."""
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = EncryptionService(master_key)
    return _encryption_service
