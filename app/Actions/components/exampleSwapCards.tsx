import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'

interface ExampleSwapCardProps {
  heading: string
  message: string
  onClick: () => void
}

export function ExampleSwapCard({ heading, message, onClick }: ExampleSwapCardProps) {
  return (
    <Button
      variant="link"
      className="bg-[#1a1a1a] border-[0.5px] border-[#292929] shadow-[0_2px_4px_0_#0000001a] h-full px-5 text-sm font-normal py-4 rounded-xl mt-0 text-left flex-col items-start justify-between hover:no-underline text-type-600 text-opacity-60"
      onClick={onClick}
    >
      {heading}
      <span className="w-full flex items-center justify-end">
        <i className="size-9 rounded-full flex justify-center items-center bg-[#171717] text-type-600">
          <IconArrowRight className="text-type-600 opacity-60" />
        </i>
      </span>
    </Button>
  )
}

