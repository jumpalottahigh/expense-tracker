import { ExpenseItem } from '../types/general'

type ValidateFormResponse = {
  isValid: boolean
  statusMessage: string[]
}

export function validateForm(formData: ExpenseItem): ValidateFormResponse {
  const formValidationResponse = {
    isValid: true,
    statusMessage: [],
  }

  if (!formData) {
    formValidationResponse.isValid = false
    formValidationResponse.statusMessage.push('Form data is missing!')
  }

  if (!formData.name) {
    formValidationResponse.isValid = false
    formValidationResponse.statusMessage.push('Expense name is missing!')
  }

  if (!formData.price) {
    formValidationResponse.isValid = false
    formValidationResponse.statusMessage.push('Expense item price is missing!')
  }

  return formValidationResponse
}
