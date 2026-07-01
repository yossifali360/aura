import * as Yup from 'yup'
import type { TFunction } from 'i18next'
import type { ApplicationType } from '@/types'

export interface ApplicationFormValues {
  age: string
  experience: string
  character_concept: string
  why_join: string
  rules_accepted: boolean
}

export const applicationInitialValues: ApplicationFormValues = {
  age: '',
  experience: '',
  character_concept: '',
  why_join: '',
  rules_accepted: false,
}

export function createApplicationSchema(t: TFunction, type: ApplicationType = 'server') {
  if (type === 'police') {
    return Yup.object({
      age: Yup.number()
        .typeError(t('validation.age_required'))
        .required(t('validation.age_required'))
        .min(17, t('validation.age_min'))
        .max(99, t('validation.age_max')),
      character_concept: Yup.string()
        .trim()
        .required(t('validation.character_name_required'))
        .max(100, t('validation.character_name_max')),
      why_join: Yup.string()
        .trim()
        .required(t('validation.why_accept_required'))
        .max(2000, t('validation.why_join_max')),
      experience: Yup.string()
        .trim()
        .max(2000, t('validation.experience_max')),
      rules_accepted: Yup.boolean()
        .oneOf([true], t('validation.rules_required')),
    })
  }

  return Yup.object({
    age: Yup.number()
      .typeError(t('validation.age_required'))
      .required(t('validation.age_required'))
      .min(17, t('validation.age_min'))
      .max(99, t('validation.age_max')),
    experience: Yup.string()
      .trim()
      .required(t('validation.experience_required'))
      .max(2000, t('validation.experience_max')),
    character_concept: Yup.string()
      .trim()
      .required(t('validation.character_required'))
      .max(3000, t('validation.character_max')),
    why_join: Yup.string()
      .trim()
      .required(t('validation.why_join_required'))
      .max(2000, t('validation.why_join_max')),
    rules_accepted: Yup.boolean()
      .oneOf([true], t('validation.rules_required')),
  })
}
