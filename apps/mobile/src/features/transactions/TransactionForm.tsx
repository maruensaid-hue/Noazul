import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { CategoryPickerModal } from "../../components/ui/CategoryPickerModal";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { dateToLocalDateString, localDateStringToDate, yearMonthLabel } from "../../lib/dates";
import { brlToCents } from "../../lib/money";
import { MAX_INSTALLMENTS, MIN_INSTALLMENTS, RECURRENCE_MONTHS_AHEAD } from "../../lib/recurrence";
import type { CategoryRow } from "../categories/repository";
import {
  transactionInputSchema,
  type RecurrenceSelection,
  type TransactionInput,
  type TxStatus,
  type TxType,
} from "./types";

export interface TransactionFormValues {
  name: string;
  type: TxType;
  status: TxStatus;
  amountInput: string;
  dueDate: string;
  categoryId: string | null;
}

interface TransactionFormProps {
  initialValues: TransactionFormValues;
  categories: CategoryRow[];
  submitLabel: string;
  isSubmitting: boolean;
  /** Only offered when creating a brand new transaction, never when editing an occurrence. */
  showRecurrenceOptions?: boolean;
  onSubmit: (input: TransactionInput, recurrence: RecurrenceSelection) => void;
  onDelete?: () => void;
}

const TYPE_OPTIONS = [
  { value: "EXPENSE" as const, label: "Despesa" },
  { value: "INCOME" as const, label: "Receita" },
];

const STATUS_OPTIONS = [
  { value: "PENDING" as const, label: "Pendente" },
  { value: "PAID" as const, label: "Pago" },
];

const RECURRENCE_OPTIONS = [
  { value: "single" as const, label: "Única" },
  { value: "fixed" as const, label: "Fixa mensal" },
  { value: "installment" as const, label: "Parcelada" },
];

export function TransactionForm({
  initialValues,
  categories,
  submitLabel,
  isSubmitting,
  showRecurrenceOptions = false,
  onSubmit,
  onDelete,
}: TransactionFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [type, setType] = useState<TxType>(initialValues.type);
  const [status, setStatus] = useState<TxStatus>(initialValues.status);
  const [amountInput, setAmountInput] = useState(initialValues.amountInput);
  const [dueDate, setDueDate] = useState(initialValues.dueDate);
  const [categoryId, setCategoryId] = useState<string | null>(initialValues.categoryId);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurrenceMode, setRecurrenceMode] = useState<RecurrenceSelection["mode"]>("single");
  const [installmentsInput, setInstallmentsInput] = useState("2");
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  function handleDateChange(event: DateTimePickerEvent, selected?: Date) {
    setShowDatePicker(Platform.OS === "ios");
    if (event.type === "set" && selected) {
      setDueDate(dateToLocalDateString(selected));
    }
  }

  function handleSubmit() {
    let amountCents: number;
    try {
      amountCents = brlToCents(amountInput);
    } catch {
      setError("Informe um valor válido, ex: 150,00");
      return;
    }

    const result = transactionInputSchema.safeParse({
      name,
      type,
      status,
      amountCents,
      dueDate,
      categoryId,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    let recurrence: RecurrenceSelection = { mode: "single" };
    if (showRecurrenceOptions && recurrenceMode === "fixed") {
      recurrence = { mode: "fixed" };
    } else if (showRecurrenceOptions && recurrenceMode === "installment") {
      const installments = Number(installmentsInput);
      if (
        !Number.isInteger(installments) ||
        installments < MIN_INSTALLMENTS ||
        installments > MAX_INSTALLMENTS
      ) {
        setError(`Informe entre ${MIN_INSTALLMENTS} e ${MAX_INSTALLMENTS} parcelas`);
        return;
      }
      recurrence = { mode: "installment", installments };
    }

    setError(null);
    onSubmit(result.data, recurrence);
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="gap-5 px-4 py-6">
      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-600">Nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Aluguel, Salário, Mercado"
          className="rounded-lg border border-gray-200 px-3 py-3 text-base"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-600">Tipo</Text>
        <SegmentedControl
          options={TYPE_OPTIONS}
          value={type}
          onChange={setType}
          activeColor={type === "INCOME" ? "#16A34A" : "#DC2626"}
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-600">
          {recurrenceMode === "installment" ? "Valor da parcela (R$)" : "Valor (R$)"}
        </Text>
        <TextInput
          value={amountInput}
          onChangeText={setAmountInput}
          placeholder="0,00"
          keyboardType="decimal-pad"
          className="rounded-lg border border-gray-200 px-3 py-3 text-base"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-600">
          {recurrenceMode === "single" ? "Vencimento" : "Primeiro vencimento"}
        </Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="rounded-lg border border-gray-200 px-3 py-3"
        >
          <Text className="text-base text-gray-900">{formatDueDate(dueDate)}</Text>
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={localDateStringToDate(dueDate)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        ) : null}
      </View>

      {showRecurrenceOptions ? (
        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-600">Repetição</Text>
          <SegmentedControl options={RECURRENCE_OPTIONS} value={recurrenceMode} onChange={setRecurrenceMode} />
          {recurrenceMode === "fixed" ? (
            <Text className="text-xs text-gray-400">
              Cria lançamentos para os próximos {RECURRENCE_MONTHS_AHEAD} meses, na mesma data a
              cada mês.
            </Text>
          ) : null}
          {recurrenceMode === "installment" ? (
            <View className="flex-row items-center gap-3">
              <Text className="text-sm text-gray-600">Número de parcelas</Text>
              <TextInput
                value={installmentsInput}
                onChangeText={setInstallmentsInput}
                keyboardType="number-pad"
                className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-base"
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-600">Categoria</Text>
        <Pressable
          onPress={() => setShowCategoryPicker(true)}
          className="flex-row items-center gap-2 rounded-lg border border-gray-200 px-3 py-3"
        >
          {selectedCategory ? (
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
          ) : null}
          <Text className="text-base text-gray-900">{selectedCategory?.name ?? "Sem categoria"}</Text>
        </Pressable>
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-600">Status</Text>
        <SegmentedControl options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </View>

      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        className="items-center rounded-lg bg-blue-600 py-4"
        style={{ opacity: isSubmitting ? 0.6 : 1 }}
      >
        <Text className="text-base font-semibold text-white">{submitLabel}</Text>
      </Pressable>

      {onDelete ? (
        <Pressable onPress={onDelete} className="items-center py-3">
          <Text className="text-base text-red-600">Excluir lançamento</Text>
        </Pressable>
      ) : null}

      <CategoryPickerModal
        visible={showCategoryPicker}
        categories={categories}
        selectedCategoryId={categoryId}
        onSelect={setCategoryId}
        onClose={() => setShowCategoryPicker(false)}
      />
    </ScrollView>
  );
}

function formatDueDate(dueDate: string): string {
  const day = dueDate.slice(8, 10);
  const [year, month] = dueDate.split("-");
  return `${day} de ${yearMonthLabel(`${year}-${month}`)}`;
}
