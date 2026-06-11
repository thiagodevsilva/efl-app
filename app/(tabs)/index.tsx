import { FlashList } from "@shopify/flash-list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandedBootScreen } from "../../components/BrandedBootScreen";
import {
  EXERCISE_LEVEL_LABELS,
  EXERCISE_LEVELS,
} from "../../constants/exerciseLevels";
import {
  exerciseListCta,
  MASTERY_TIER_COLORS,
  MASTERY_TIER_LABELS,
  PROGRESS_FILTER_OPTIONS,
  SORT_OPTIONS,
  type ExerciseListProgressFilter,
  type ExerciseListSort,
} from "../../constants/exerciseMastery";
import {
  exerciseMediaUrl,
  listExerciseLists,
  type ExerciseList,
  type ExerciseListLevel,
  type MasteryTier,
} from "../../services/exercises";
import { listMyCourses, type MyClassItem } from "../../services/classroom";

const PAGE_SIZE = 12;

type LevelFilter = "" | ExerciseListLevel;

function MasteryBadges({ item }: { item: ExerciseList }) {
  const progress = item.myProgress;
  if (!progress) return null;

  const tier = progress.masteryTier;
  const showTier = tier !== "none";
  const tierStyle =
    showTier && tier !== "none"
      ? MASTERY_TIER_COLORS[tier as Exclude<MasteryTier, "none">]
      : null;

  if (!showTier && !progress.inProgress && progress.completionCount === 0) return null;

  return (
    <View className="mt-2 flex-row flex-wrap items-center gap-2">
      {showTier && tierStyle ? (
        <View className={`rounded-full px-2.5 py-1 ${tierStyle.bg}`}>
          <Text className={`text-xs font-semibold ${tierStyle.text}`}>
            {MASTERY_TIER_LABELS[tier as Exclude<MasteryTier, "none">]}
          </Text>
        </View>
      ) : null}
      {progress.inProgress ? (
        <View className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1">
          <Text className="text-xs font-medium text-sky-800">Em andamento</Text>
        </View>
      ) : null}
      {progress.completionCount > 0 ? (
        <Text className="text-xs text-slate-500">
          Praticada {progress.completionCount}{" "}
          {progress.completionCount === 1 ? "vez" : "vezes"}
        </Text>
      ) : null}
    </View>
  );
}

function ListCard({ item }: { item: ExerciseList }) {
  const coverUri = item.imagePath ? exerciseMediaUrl(item.imagePath) : null;
  const cta = exerciseListCta(item.myProgress);
  const ctaColor = item.myProgress?.inProgress ? "text-sky-600" : "text-indigo-600";

  return (
    <Pressable
      className="mx-4 mb-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white active:bg-slate-50"
      onPress={() => router.push(`/play-exercise/${item.id}`)}
    >
      {coverUri ? (
        <Image
          source={{ uri: coverUri }}
          style={{ width: "100%", height: 152 }}
          resizeMode="cover"
        />
      ) : (
        <View className="h-[152px] w-full items-center justify-center bg-indigo-600/90">
          <Text className="px-6 text-center text-2xl font-bold text-white/95">
            {item.title.slice(0, 1).toUpperCase()}
          </Text>
          <Text
            className="mt-1 px-6 text-center text-xs font-medium uppercase tracking-wider text-white/80"
            numberOfLines={1}
          >
            {item.theme}
          </Text>
        </View>
      )}
      <View className="p-4">
        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full bg-slate-100 px-2.5 py-1">
            <Text className="text-xs font-medium text-slate-700">{item.theme}</Text>
          </View>
          <View className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
            <Text className="text-xs font-medium text-slate-600">
              {EXERCISE_LEVEL_LABELS[item.level]}
            </Text>
          </View>
        </View>
        <MasteryBadges item={item} />
        <Text className="mt-3 text-lg font-semibold text-slate-900" numberOfLines={2}>
          {item.title}
        </Text>
        {item.description ? (
          <Text className="mt-1.5 text-sm leading-5 text-slate-600" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View className="mt-4 flex-row items-center justify-between">
          <Text className={`text-sm font-medium ${ctaColor}`}>{cta}</Text>
          <Text className={`text-lg ${ctaColor}`}>→</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<LevelFilter>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOnlyMyClass, setFilterOnlyMyClass] = useState(false);
  const [classId, setClassId] = useState("");
  const [sort, setSort] = useState<ExerciseListSort>("default");
  const [progressFilter, setProgressFilter] = useState<ExerciseListProgressFilter>("all");

  const classesQuery = useQuery({
    queryKey: ["my-classes-for-exercises"],
    queryFn: listMyCourses,
  });

  const activeClasses = useMemo(
    () =>
      (classesQuery.data?.classes ?? []).filter(
        (c: MyClassItem) => (c.enrollmentStatus ?? "ACTIVE") === "ACTIVE",
      ),
    [classesQuery.data?.classes],
  );

  const query = useQuery({
    queryKey: [
      "exercise-lists",
      page,
      level,
      searchQuery,
      filterOnlyMyClass,
      classId,
      sort,
      progressFilter,
    ],
    queryFn: () =>
      listExerciseLists({
        page,
        limit: PAGE_SIZE,
        ...(level ? { level } : {}),
        ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
        ...(filterOnlyMyClass && classId ? { classId } : {}),
        ...(filterOnlyMyClass && !classId ? { onlyMyClasses: true } : {}),
        ...(sort !== "default" ? { sort } : {}),
        ...(progressFilter !== "all" ? { progressFilter } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const lists = query.data?.data ?? [];
  const meta = query.data?.meta;
  const totalPages = useMemo(() => {
    if (!meta?.total) return 1;
    return Math.max(1, Math.ceil(meta.total / (meta.limit || PAGE_SIZE)));
  }, [meta]);

  const emptyMessage = useMemo(() => {
    if (progressFilter === "notDone") {
      return "Você já concluiu todas as listas visíveis. Ótimo trabalho!";
    }
    if (progressFilter === "inProgress") {
      return "Nenhuma lista em andamento no momento.";
    }
    if (progressFilter === "done") {
      return "Você ainda não concluiu nenhuma lista.";
    }
    if (filterOnlyMyClass && activeClasses.length === 0) {
      return "Você não está em turmas ativas com exercícios vinculados.";
    }
    if (filterOnlyMyClass && classId) {
      return "Nenhuma lista de exercícios para esta turma no momento.";
    }
    if (searchQuery.trim()) {
      return "Nenhuma lista encontrada para esta busca.";
    }
    return "Nenhuma lista disponível no momento.";
  }, [progressFilter, filterOnlyMyClass, activeClasses.length, classId, searchQuery]);

  const header = (
    <View className="pb-2 pt-1">
      <Text className="px-4 text-3xl font-bold tracking-tight text-slate-900">
        Exercícios
      </Text>
      <Text className="mt-2 px-4 text-base leading-6 text-slate-600">
        Escolha uma lista por tema. Cada questão aparece uma por vez; se errar, ela volta
        para o final da fila — igual ao site.
      </Text>
      <TextInput
        className="mx-4 mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-900"
        placeholder="Buscar por título ou tema..."
        value={searchQuery}
        onChangeText={(t) => {
          setSearchQuery(t);
          setPage(1);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 pl-4"
        contentContainerStyle={{ paddingRight: 16, gap: 8 }}
      >
        {SORT_OPTIONS.map((opt) => {
          const selected = sort === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                setSort(opt.value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 ${
                selected ? "bg-slate-800" : "border border-slate-200 bg-white"
              }`}
            >
              <Text
                className={`text-sm font-medium ${selected ? "text-white" : "text-slate-700"}`}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 pl-4"
        contentContainerStyle={{ paddingRight: 16, gap: 8 }}
      >
        {PROGRESS_FILTER_OPTIONS.map((opt) => {
          const selected = progressFilter === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                setProgressFilter(opt.value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 ${
                selected ? "bg-indigo-600" : "border border-slate-200 bg-white"
              }`}
            >
              <Text
                className={`text-sm font-medium ${selected ? "text-white" : "text-slate-700"}`}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text className="mt-2 px-4 text-xs leading-5 text-slate-400">
        Maestria: Concluída (1–2x) · Bronze (3–5x) · Prata (6–8x) · Ouro (9–14x) · Diamante
        (15x+)
      </Text>
      <Pressable
        className="mx-4 mt-3 flex-row items-center gap-2"
        onPress={() => {
          setFilterOnlyMyClass((v) => !v);
          if (filterOnlyMyClass) setClassId("");
          setPage(1);
        }}
      >
        <View
          className={`h-5 w-5 items-center justify-center rounded border ${
            filterOnlyMyClass ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
          }`}
        >
          {filterOnlyMyClass ? <Text className="text-xs text-white">✓</Text> : null}
        </View>
        <Text className="text-sm text-slate-700">Ver apenas exercícios da minha turma</Text>
      </Pressable>
      {filterOnlyMyClass ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3 pl-4"
          contentContainerStyle={{ paddingRight: 16, gap: 8 }}
        >
          <Pressable
            onPress={() => {
              setClassId("");
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 ${
              classId === "" ? "bg-slate-800" : "border border-slate-200 bg-white"
            }`}
          >
            <Text
              className={`text-sm font-medium ${classId === "" ? "text-white" : "text-slate-700"}`}
            >
              Todas as minhas turmas
            </Text>
          </Pressable>
          {activeClasses.map((c) => {
            const selected = classId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  setClassId(c.id);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 ${
                  selected ? "bg-indigo-700" : "border border-slate-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${selected ? "text-white" : "text-slate-700"}`}
                  numberOfLines={1}
                >
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 pl-4"
        contentContainerStyle={{ paddingRight: 16, gap: 8 }}
      >
        <Pressable
          onPress={() => {
            setLevel("");
            setPage(1);
          }}
          className={`rounded-full px-4 py-2 ${
            level === "" ? "bg-slate-900" : "border border-slate-200 bg-white"
          }`}
        >
          <Text
            className={`text-sm font-medium ${level === "" ? "text-white" : "text-slate-700"}`}
          >
            Todos os níveis
          </Text>
        </Pressable>
        {EXERCISE_LEVELS.map((lv) => {
          const selected = level === lv;
          return (
            <Pressable
              key={lv}
              onPress={() => {
                setLevel(lv);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 ${
                selected ? "bg-indigo-600" : "border border-slate-200 bg-white"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${selected ? "text-white" : "text-slate-700"}`}
              >
                {lv}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  if (query.isPending && !query.data) {
    return <BrandedBootScreen message="A carregar as suas listas de exercícios…" />;
  }

  if (query.isError) {
    return (
      <View className="flex-1 justify-center bg-slate-50 px-6">
        <Text className="text-center text-lg font-semibold text-slate-900">
          Algo deu errado
        </Text>
        <Text className="mt-2 text-center text-base text-slate-600">
          Não foi possível carregar as listas. Puxe para atualizar ou tente de novo.
        </Text>
        <Pressable
          className="mt-6 items-center self-center rounded-xl bg-slate-900 px-6 py-3"
          onPress={() => void query.refetch()}
        >
          <Text className="font-semibold text-white">Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const footer =
    meta && meta.total > PAGE_SIZE ? (
      <View className="flex-row items-center justify-center gap-3 py-6">
        <Pressable
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || query.isFetching}
          className={`rounded-xl border px-4 py-2.5 ${
            page <= 1 ? "border-slate-200 opacity-40" : "border-slate-300 bg-white"
          }`}
        >
          <Text className="text-sm font-medium text-slate-800">Anterior</Text>
        </Pressable>
        <Text className="text-sm text-slate-500">
          {page} / {totalPages}
        </Text>
        <Pressable
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || query.isFetching}
          className={`rounded-xl border px-4 py-2.5 ${
            page >= totalPages ? "border-slate-200 opacity-40" : "border-slate-300 bg-white"
          }`}
        >
          <Text className="text-sm font-medium text-slate-800">Próxima</Text>
        </Pressable>
      </View>
    ) : (
      <View className="h-6" />
    );

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingBottom: insets.bottom }}>
      <FlashList
        data={lists}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={
          <View className="mx-4 mt-4 rounded-2xl border border-slate-200 bg-white p-8">
            <Text className="text-center text-base text-slate-600">{emptyMessage}</Text>
          </View>
        }
        renderItem={({ item }) => <ListCard item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isPending}
            onRefresh={() => void query.refetch()}
            tintColor="#4f46e5"
          />
        }
      />
    </View>
  );
}
