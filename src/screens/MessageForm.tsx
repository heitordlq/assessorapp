import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import api from '../services/api';

interface MessageFormProps {
  messageId?: string;
  onSuccess?: () => void;
}

export function MessageForm({ messageId, onSuccess }: MessageFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (messageId) {
      loadMessage();
    }
  }, [messageId]);

  async function loadMessage() {
    try {
      const response = await api.get(`/mensagens/${messageId}`);
      const message = response.data;
      setTitle(message.title);
      setContent(message.content);
      setCategory(message.category);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setError('');

      if (!title || !content || !category) {
        setError('Preencha todos os campos');
        return;
      }

      if (messageId) {
        await api.put(`/mensagens/${messageId}`, {
          title,
          content,
          category,
        });
      } else {
        await api.post('/mensagens', {
          title,
          content,
          category,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);
      setError('Erro ao salvar mensagem');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {messageId ? 'Editar Mensagem' : 'Nova Mensagem'}
      </Text>

      <TextInput
        label="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        label="Categoria"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />

      <TextInput
        label="Conteúdo"
        value={content}
        onChangeText={setContent}
        style={styles.input}
        multiline
        numberOfLines={4}
      />

      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={styles.button}
      >
        {messageId ? 'Atualizar' : 'Criar'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
}); 