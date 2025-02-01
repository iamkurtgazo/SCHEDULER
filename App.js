import React, { useState } from 'react';
import { View, Text, FlatList, Button, TextInput, ScrollView } from 'react-native';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const employees = [
  'Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank',
  'Grace', 'Hannah', 'Ian', 'Jack', 'Karen', 'Leo'
];

const shifts = ['8 AM - 5 PM', '6 AM - 3 PM'];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const generateSchedule = () => {
  return employees.map((employee) => ({
    name: employee,
    shift: shifts[Math.floor(Math.random() * shifts.length)],
    daysOff: '',
  }));
};

export default function App() {
  const [schedule, setSchedule] = useState(generateSchedule());
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempDaysOff, setTempDaysOff] = useState('');
  const [newEmployee, setNewEmployee] = useState('');

  const saveDaysOff = (index) => {
    const updatedSchedule = [...schedule];
    const daysArray = tempDaysOff.split(',').map(day => day.trim());
    if (daysArray.length <= 2 && daysArray.every(day => daysOfWeek.includes(day))) {
      updatedSchedule[index].daysOff = tempDaysOff;
      setSchedule(updatedSchedule);
      setEditingIndex(null);
    } else {
      alert("Please enter up to two valid days off separated by a comma.");
    }
  };

  const exportToExcel = async () => {
    let worksheet = XLSX.utils.json_to_sheet(schedule);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
    const excelFile = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    const fileUri = FileSystem.documentDirectory + "schedule.xlsx";
    await FileSystem.writeAsStringAsync(fileUri, excelFile, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(fileUri);
  };

  const addEmployee = () => {
    if (newEmployee.trim()) {
      setSchedule([...schedule, { name: newEmployee, shift: shifts[0], daysOff: '' }]);
      setNewEmployee('');
    }
  };

  const deleteEmployee = (index) => {
    const updatedSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(updatedSchedule);
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        Automated Employee Scheduler
      </Text>
      <TextInput
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
        value={newEmployee}
        onChangeText={setNewEmployee}
        placeholder="Enter new employee name"
      />
      <Button title="Add Employee" color="green" onPress={addEmployee} />
      <Button title="Generate Schedule" color="blue" onPress={() => setSchedule(generateSchedule())} />
      <FlatList
        data={schedule}
        keyExtractor={(item) => item.name}
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}>
            <Text>{item.name}</Text>
            <Text>Shift: {item.shift}</Text>
            {editingIndex === index ? (
              <>
                <TextInput
                  style={{ borderWidth: 1, padding: 5, marginVertical: 5 }}
                  value={tempDaysOff}
                  onChangeText={setTempDaysOff}
                  placeholder="Enter days off (e.g., Monday, Tuesday)"
                />
                <Button title="Save" color="orange" onPress={() => saveDaysOff(index)} />
              </>
            ) : (
              <>
                <Text>Days Off: {item.daysOff || 'None'}</Text>
                <Button title="Edit" color="purple" onPress={() => { setEditingIndex(index); setTempDaysOff(item.daysOff); }} />
                <Button title="Delete" color="red" onPress={() => deleteEmployee(index)} />
              </>
            )}
          </View>
        )}
      />
      <Button title="Export to Excel" color="darkblue" onPress={exportToExcel} />
    </ScrollView>
  );
}
