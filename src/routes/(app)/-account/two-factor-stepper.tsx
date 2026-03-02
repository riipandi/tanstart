import { clx } from '#/utils/variant'

interface TwoFactorStepperProps {
  currentStep: number
  steps: string[]
}

export function TwoFactorStepper({ currentStep, steps }: TwoFactorStepperProps) {
  return (
    <div className='mb-6 flex items-center justify-center gap-2'>
      {steps.map((step, index) => (
        <div key={step} className='flex items-center gap-2'>
          <div
            className={clx(
              'size-2.5 rounded-full transition-all duration-300',
              index + 1 <= currentStep
                ? 'bg-background-primary scale-125'
                : 'bg-background-neutral-faded'
            )}
            title={`Step ${index + 1}: ${step}`}
          />
          {index < steps.length - 1 && (
            <div
              className={clx(
                'h-0.5 w-8 transition-all duration-300',
                index + 1 < currentStep ? 'bg-background-primary' : 'bg-background-neutral-faded'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
