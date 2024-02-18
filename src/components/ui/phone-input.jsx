import { CheckIcon, ChevronsUpDown } from "lucide-react";
import React, { forwardRef, useCallback } from "react";
import * as RPNInput from "react-phone-number-input";
import * as RPNInputSimple from "react-phone-number-input/input";
import flags from "react-phone-number-input/flags";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input, InputProps } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PhoneInputSimple = ({
  className,
  children,
  ...props
}) => (
  <RPNInputSimple.default
    placeholder="Enter a phone number"
    inputComponent={Input}
    {...props}
  />
);
PhoneInputSimple.displayName = "PhoneInputSimple";

const PhoneInput = ({ className, children, ...props }) => (
  <RPNInput.default
    className={cn("flex", className)}
    placeholder={"Enter a phone number"}
    flagComponent={FlagComponent}
    countrySelectComponent={CountrySelect}
    inputComponent={InputComponent}
    {...props}
  />
);

PhoneInput.displayName = "PhoneInput";

const InputComponent = forwardRef(({ className, ...props }, ref) => (
  <Input
    className={cn("rounded-s-none rounded-e-lg", className)}
    {...props}
    ref={ref}
  />
));

InputComponent.displayName = "InputComponent";

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
  defaultCountry
}) => {
  const handleSelect = useCallback(
    (country) => {
      onChange(country);
    },
    [onChange],
  );

  const selectedCountry = value ? value : defaultCountry;

  return (
    <Popover>
      <PopoverTrigger asChild>
      {selectedCountry && (
        <Button
          type="button"
          variant={"outline"}
          className={cn("rounded-e-none rounded-s-lg pl-3 pr-1 flex gap-1")}
          disabled={disabled}>
          <span className="flex items-center truncate">
            <div className="bg-foreground/20 rounded-sm flex w-6 h-4">
              <FlagComponent country={selectedCountry} countryName={selectedCountry} />
            </div>
          </span>
          <ChevronsUpDown className={`h-4 w-4 ${disabled ? "hidden" : ""}`} />
        </Button>
      )}
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.value)
                .map((option) => (
                  <CommandItem
                    className={"text-sm gap-2"}
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}>
                    <FlagComponent
                      country={option.value}
                      countryName={option.label}
                    />
                    <span>{option.label}</span>
                    <span className="text-foreground/50">
                      {`+${RPNInput.getCountryCallingCode(option.value)}`}
                    </span>
                    <CheckIcon
                      className={`ml-auto h-4 w-4 ${
                        option.value === value ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }) => {
  const Flag = flags[country];

  return (
    <span
      className={"inline object-contain w-6 h-4 overflow-hidden rounded-sm"}>
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput, PhoneInputSimple };
