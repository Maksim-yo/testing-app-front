import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Button } from "@mui/material";
import Roboto from "../../fonts/Roboto-Regular.ttf";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: Roboto,
});

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 11, fontFamily: "Roboto" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  nameEmail: { flexGrow: 1 },
  name: { fontSize: 14, fontWeight: "bold" },
  email: { fontSize: 10, color: "#555" },
  position: { fontSize: 12, marginBottom: 8 },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 10,
    color: "white",
    alignSelf: "flex-start",
    marginRight: 8,
    marginBottom: 4,
  },
  chipSuccess: { backgroundColor: "#4caf50" },
  chipWarning: { backgroundColor: "#ff9800" },
  chipError: { backgroundColor: "#f44336" },
  chipDefault: { backgroundColor: "#9e9e9e" },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  flexRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { width: 140, fontWeight: "bold" },
  belbinChip: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
    fontSize: 10,
    color: "white",
    marginRight: 6,
    marginBottom: 4,
  },
  belbinChipSecondary: { backgroundColor: "#9c27b0" }, // purple
  recommendationRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  recommendationGood: { backgroundColor: "rgba(0,128,0,0.1)" },
  recommendationBad: { backgroundColor: "rgba(255,0,0,0.1)" },
});

const getPercentColor = (percent) => {
  if (percent === null || percent === undefined) return styles.chipDefault;
  if (percent >= 80) return styles.chipSuccess;
  if (percent >= 50) return styles.chipWarning;
  return styles.chipError;
};
const getPhotoUrl = (photo) => {
  if (!photo) return null;

  if (typeof photo === "string") {
    if (photo.startsWith("data:image")) {
      return photo;
    }
    return `data:image/jpeg;base64,${photo}`;
  }

  if (photo instanceof File) {
    return URL.createObjectURL(photo); // Если это File объект
  }

  return null;
};

export const MyDoc = ({ results }) => (
  <Document>
    {results.map((result, idx) => {
      const findRoleScore = (roleName) => {
        const found = result.belbin_results?.find(
          (r) => r.role.name === roleName
        );
        return found ? found.total_score : 0;
      };
      // Helper to find belbin score by role name
      const allRolesMet = result.employee.position?.belbin_requirements?.every(
        (req) => {
          const roleScore = findRoleScore(req.role.name);
          return roleScore >= req.min_score;
        }
      );
      return (
        <Page key={idx} size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Информация о сотруднике</Text>

            <View style={styles.flexRow}>
              <Text style={styles.label}>ФИО:</Text>
              <Text>
                {result.employee.last_name} {result.employee.first_name}
              </Text>
            </View>

            {result.employee.email && (
              <View style={styles.flexRow}>
                <Text style={styles.label}>Email:</Text>
                <Text>{result.employee.email}</Text>
              </View>
            )}

            <View style={styles.flexRow}>
              <Text style={styles.label}>Должность:</Text>
              <Text>{result.employee.position?.title || "—"}</Text>
            </View>
          </View>

          <View style={styles.flexRow}>
            <Text style={styles.label}>Процент выполнения:</Text>
            <View style={[styles.chip, getPercentColor(result.percent)]}>
              <Text>
                {result.percent !== null && result.percent !== undefined
                  ? `${result.percent.toFixed(2)}%`
                  : "—"}
              </Text>
            </View>
          </View>

          <View style={styles.flexRow}>
            <Text style={styles.label}>Набранные баллы:</Text>
            <View style={[styles.chip, styles.chipSuccess]}>
              <Text>{`${result.score ?? "—"} из ${
                result.max_score ?? "—"
              }`}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Результаты Белбин теста:</Text>
            {result.belbin_results && result.belbin_results.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {result.belbin_results
                  .filter((role) => role.total_score > 0)
                  .map((role) => (
                    <View
                      key={role.role.id}
                      style={[styles.belbinChip, styles.belbinChipSecondary]}
                    >
                      <Text>
                        {role.role?.name ?? role.role.id}: {role.total_score}
                      </Text>
                    </View>
                  ))}
              </View>
            ) : (
              <Text>Белбин-тест не проходился</Text>
            )}
          </View>

          {result.employee.position?.belbin_requirements &&
          result.employee.position.belbin_requirements.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Рекомендации по ролям для должности:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {result.employee.position.title}
                </Text>
              </Text>

              {result.employee.position.belbin_requirements.map((rec) => {
                const userScore = findRoleScore(rec.role.name);
                const isBelow = userScore < rec.min_score;
                return (
                  <View
                    key={rec.role.id}
                    style={[
                      styles.recommendationRow,
                      isBelow
                        ? styles.recommendationBad
                        : styles.recommendationGood,
                    ]}
                  >
                    <Text style={{ width: 120 }}>{rec.role.name}</Text>
                    <View style={[styles.chip, styles.chipWarning]}>
                      <Text>Рекомендуемый: {rec.min_score}</Text>
                    </View>
                    <View
                      style={[
                        styles.chip,
                        isBelow ? styles.chipError : styles.chipSuccess,
                      ]}
                    >
                      <Text>Ваш балл: {userScore}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ marginTop: 10, color: "#555" }}>
              Нет рекомендаций для этой должности
            </Text>
          )}
          {result.employee.position?.belbin_requirements?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Итог:</Text>
              <Text>
                {allRolesMet
                  ? "Должность рекомендуется на основе результатов Белбин-теста."
                  : "Должность не рекомендуется: не все роли соответствуют минимальным требованиям."}
              </Text>
            </View>
          )}
        </Page>
      );
    })}
  </Document>
);
