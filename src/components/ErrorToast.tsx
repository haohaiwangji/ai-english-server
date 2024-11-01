'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@nextui-org/react";
import { useState } from "react";

export function useErrorToast() {
  const [errorMessage, setErrorMessage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const showError = (message: string) => {
    setErrorMessage(message);
    onOpen();
    // 3秒后自动关闭
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const ErrorModal = () => (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="sm"
      placement="top"
      classNames={{
        base: "bg-danger-50",
        header: "border-b-0",
        body: "py-3",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-danger">错误</ModalHeader>
        <ModalBody>
          <p>{errorMessage}</p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return { showError, ErrorModal };
} 