import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { normalizeDomainToken } from "@/features/addresses/schemas/address-form";

export const DomainPicker = ({
  domains,
  value,
  onValueChange,
  onBlur,
  id,
  name,
  isLoading = false,
  invalid = false,
}: {
  domains: string[];
  value: string;
  onValueChange: (domain: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  isLoading?: boolean;
  invalid?: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="border-input flex h-10 w-full items-center rounded-lg border px-2.5">
        <Skeleton className="h-4 w-2/3 rounded-sm" />
      </div>
    );
  }

  if (domains.length <= 1) {
    return (
      <Input id={id} disabled value={domains[0] ?? ""} aria-invalid={invalid} />
    );
  }

  return (
    <Combobox
      items={domains}
      value={value.length > 0 ? value : null}
      onValueChange={next =>
        onValueChange(normalizeDomainToken(String(next ?? "")))
      }
    >
      <ComboboxInput
        id={id}
        name={name}
        placeholder="Search domain"
        className="h-10 w-full"
        aria-invalid={invalid}
        onBlur={onBlur}
        showClear={value.length > 0}
      />
      <ComboboxContent>
        <ComboboxEmpty>No matching domain.</ComboboxEmpty>
        <ComboboxList>
          {(domain: string) => (
            <ComboboxItem key={domain} value={domain}>
              {domain}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
